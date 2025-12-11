// 'use client';

// import { useEffect, useState } from 'react';
// import Loading from '@/app/loading';
// import { axiosRequester } from '@/lib/axios/axios.js';
// import { useDispatch, useSelector } from 'react-redux';
// import { setCredentials, logout, setAuthLoading } from '@/redux/slices/authSlice.js';
// import { mapUserRole } from '@/app/services/workers/userRoleMapper.js';

// // Graceful AppInitializer that keeps the app logged in as long as the
// // stored access token is present and not expired. It will call the
// // refresh endpoint only when the token is missing or expired.
// export default function AppInitializer({ children }) {
//     const [loading, setLoading] = useState(true);
//     const dispatch = useDispatch();
//     const existingToken = useSelector((s) => s.auth?.token);

//     // Lazy-load jwt-decode so app doesn't crash if it's missing at build-time
//     let jwtDecode;
//     try {
//         // eslint-disable-next-line import/no-extraneous-dependencies
//         // import shape normalized: could be default or named
//         // require is used so this file still runs in environments where
//         // top-level ESM imports could cause issues.
//         // eslint-disable-next-line global-require
//         const lib = require('jwt-decode');
//         jwtDecode = lib && (lib.default || lib);
//     } catch (_) {
//         jwtDecode = null;
//     }

//     useEffect(() => {
//         let mounted = true;

//         (async () => {
//             dispatch(setAuthLoading(true));
//             console.debug('[AppInitializer] init:start');

//             // helper: check token expiry with small buffer (30s)
//             const isTokenValid = (token) => {
//                 if (!token || !jwtDecode) return false;
//                 try {
//                     const payload = jwtDecode(token);
//                     const exp = payload?.exp;
//                     if (!exp) return false;
//                     const expiresAt = exp * 1000;
//                     const bufferMs = 30 * 1000; // 30 seconds
//                     return Date.now() + bufferMs < expiresAt;
//                 } catch (e) {
//                     return false;
//                 }
//             };

//             try {
//                 // If we already have a valid token in Redux, preserve session.
//                 if (existingToken && isTokenValid(existingToken)) {
//                     console.debug('[AppInitializer] existing token valid — skipping refresh');
//                     return;
//                 }

//                 // No valid token — attempt refresh using httpOnly cookie
//                 console.debug('[AppInitializer] no valid token, calling refresh');
//                 const res = await axiosRequester.post('/api/staff/auth/refresh-token', {}, { withCredentials: true });
//                 const r = res?.data || {};
//                 const token = r?.data?.accessToken || r?.data?.token || r?.token || r?.accessToken || r?.data?.access_token || r?.access_token || null;
//                 const user = r?.data?.user || r?.user || null;

//                 if (!token) {
//                     console.debug('[AppInitializer] refresh returned no token — logging out');
//                     dispatch(logout());
//                     return;
//                 }

//                 const mappedUser = user ? mapUserRole(user) : null;
//                 dispatch(setCredentials({ user: mappedUser, token }));
//                 console.debug('[AppInitializer] refresh successful');
//             } catch (err) {
//                 console.debug('[AppInitializer] refresh failed', err?.message || err);
//                 dispatch(logout());
//             } finally {
//                 if (mounted) {
//                     dispatch(setAuthLoading(false));
//                     setLoading(false);
//                     console.debug('[AppInitializer] init:done');
//                 }
//             }
//         })();

//         return () => (mounted = false);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [dispatch]);

//     if (loading) return <Loading />;

//     return <>{children}</>;
// }

"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axiosRequester from "@/lib/axios/axios";
import { setCredentials, logout } from "@/redux/slices/authSlice";
import { store } from '@/redux/store';
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Loading from "@/app/loading";

const AppInitializer = ({ children }) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const rehydrateAuth = async () => {
            try {
                const { data } = await axiosRequester.post(
                    "/api/staff/auth/refresh-token",
                    {},
                    { withCredentials: true }
                );

                console.log("🔄 Refresh Response:", data);

                const newAccessToken = data.data?.accessToken;
                if (!newAccessToken) {
                    dispatch(logout());
                    return;
                }

                // const isEmailConfirmed = data.data?.isEmailConfirmed;
                // const isStatusConfirmed = data.data?.isStatusConfirmed;
                // const stateRequest = data.data?.stateRequest;
                // const isTermsApproved = data.data?.isTermsApproved ?? false;
                // const isInfoReview = data.data?.isInfoReview ?? null;

                const decoded = jwtDecode(newAccessToken);
                console.log("✅ Decoded:", decoded);
                console.log({
                    'api data :': {
                        email: decoded.emailAddress,
                        user: decoded.user,
                        role: data.data?.role ?? data.data?.role?.id,
                        roleKey: data.data?.roleKey ?? data.data?.role?.roleKey,
                        departments: data.data?.departments,
                        branches: data.data?.branches,
                        divisions: data.data?.divisions,
                    },
                });

                // Build a normalized mappedUser object so the slice mapping picks expected fields
                let mappedUser = {};
                mappedUser.email = decoded?.emailAddress ?? data?.data?.email ?? null;

                // Set userId/username when decoded.user is a primitive id or when API provides them
                if (typeof decoded.user === 'string') mappedUser.userId = decoded.user;
                if (data?.data?.userId) mappedUser.userId = mappedUser.userId ?? data.data.userId;
                if (data?.data?.username) mappedUser.username = mappedUser.username ?? data.data.username;

                // role normalization: API may provide role as primitive id and roleKey at top-level
                const apiRole = data?.data?.role;
                const apiRoleKey = data?.data?.roleKey ?? data?.data?.role?.roleKey ?? null;
                if (apiRole) {
                    mappedUser.role = typeof apiRole === 'object' ? apiRole : { id: apiRole, roleKey: apiRoleKey };
                } else if (decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) {
                    mappedUser.role = { id: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] };
                }

                mappedUser.branches = data?.data?.branches ?? decoded.user?.branches ?? [];
                mappedUser.departments = data?.data?.departments ?? decoded.user?.departments ?? [];
                mappedUser.divisions = data?.data?.divisions ?? decoded.user?.divisions ?? [];

                // derive branch shortcuts
                mappedUser.branchId = mappedUser.branches?.[0]?.id ?? null;
                mappedUser.branchName = mappedUser.branches?.[0]?.branchName ?? null;

                // Dispatch under `data` so authSlice mapping uses the normalized object
                dispatch(
                    setCredentials({
                        data: mappedUser,
                        token: newAccessToken,
                        email: mappedUser.email,
                    })
                );

                // DEBUG: print auth slice after setting credentials (dev only)
                try {
                    if (process.env.NODE_ENV !== 'prod') {
                        // print a concise snapshot
                        console.log('[AppInitializer] auth slice after setCredentials:', store.getState().auth);
                    }
                } catch (e) {
                    // ignore in environments where store isn't accessible
                }
            } catch (error) {
                console.log("❌ Rehydration failed:", error.response?.data || error.message);
                dispatch(logout());
                // router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        rehydrateAuth();
    }, [dispatch, router]);

    if (loading) {
        return <Loading />;
    }

    return <>{children}</>;
};

export default AppInitializer;
