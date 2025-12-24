'use client';

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import axiosRequester from '@/lib/axios/axios';

import { setCredentials, setUser, logout as logoutAction } from '@/redux/slices/authSlice.js';
import { closeModal } from '@/redux/slices/modalSlice.js';
import { mapUserRole } from '@/app/services/workers/userRoleMapper.js';
import { canView as canViewHelper, canAct as canActHelper } from '@/app/services/workers/pathHelpers.worker.js';
import { getPathsForRole } from '@/app/services/maps/appPathsStructure.map.js';
import { getPermissionMaps } from '@/app/services/auth/permissionMaps.js';

// helper: extract user info from accessToken using jwt-decode
function extractUserFromAccessToken(token) {
    try {
        const decoded = jwtDecode(token);
        return {
            id: decoded.user || decoded.sub || null,
            email: decoded.emailAddress || decoded.email || null,
            role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role || null,
            rawPayload: decoded,
        };
    } catch (e) {
        console.error('extractUserFromAccessToken error', e);
        return null;
    }
}

export function useAuth() {
    const dispatch = useDispatch();
    const qc = useQueryClient();

    const auth = useSelector(s => s.auth);
    const user = auth?.user || null;
    const token = auth?.token || null;
    const isAuthenticated = Boolean(auth?.isAuthenticated);

    // Use external API base when available to avoid hitting non-existent local API routes
    const API_BASE = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_BASE_URL)
        ? String(process.env.NEXT_PUBLIC_BASE_URL).replace(/\/$/, '')
        : '';

    // -------------------------
    // LOGIN
    // -------------------------
    const loginMutation = useMutation({
        mutationFn: async (payload) => {
            try {
                const res = await axiosRequester.post('/api/staff/auth/login', payload);
                return res.data;
            } catch (err) {
                throw err?.response?.data || err;
            }
        },
        onSuccess: (body) => {
            // expected shape: { status: true, message: '...', data: { accessToken: '...', ...userData }, errors: null }
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;

            // prefer server-provided user object when available (body.data or body.user)
            const serverUser = body?.data && (Object.keys(body.data).length > 0) ? body.data : (body?.user || null);

            let mappedUser = null;
            let extracted = null;
            if (serverUser) {
                try { mappedUser = mapUserRole(serverUser); } catch (e) { mappedUser = null; }
            }

            if (accessToken) {
                extracted = extractUserFromAccessToken(accessToken);
                if (!mappedUser && extracted) {
                    try { mappedUser = mapUserRole(extracted); } catch (e) { mappedUser = null; }
                }
            }

            // ensure common fields exist on mappedUser for consistent state
            mappedUser = mappedUser || {};
            mappedUser.email = mappedUser.email ?? extracted?.email ?? mappedUser?.email ?? null;
            mappedUser.role = mappedUser.role ?? extracted?.role ?? mappedUser?.role ?? null;
            mappedUser.branches = mappedUser.branches ?? (serverUser?.branches ?? []);
            mappedUser.departments = mappedUser.departments ?? (serverUser?.departments ?? []);
            mappedUser.divisions = mappedUser.divisions ?? (serverUser?.divisions ?? []);

            const tokenVal = accessToken || (body?.token || body?.accessToken || null);
            dispatch(setCredentials({ user: mappedUser, token: tokenVal, email: mappedUser.email ?? extracted?.email ?? null }));
            try { qc.setQueryData(['auth', 'refresh'], mappedUser); } catch (e) { }
            try { dispatch(closeModal()); } catch (e) { }
        },
        onError: (err) => {
            console.error('login error', err);
        },
    });

    const login = useCallback(async (payload) => {
        try {
            const body = await loginMutation.mutateAsync(payload);
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;
            const serverUser = body?.data && (Object.keys(body.data).length > 0) ? body.data : (body?.user || null);

            let mappedUser = null;
            if (serverUser) {
                try { mappedUser = mapUserRole(serverUser); } catch (e) { mappedUser = null; }
            } else if (accessToken) {
                const userObj = extractUserFromAccessToken(accessToken);
                mappedUser = userObj ? mapUserRole(userObj) : null;
            }

            // enrich mappedUser similarly so caller receives consistent shape
            let extracted = null;
            if (accessToken) extracted = extractUserFromAccessToken(accessToken);
            mappedUser = mappedUser || {};
            mappedUser.email = mappedUser.email ?? extracted?.email ?? null;
            mappedUser.role = mappedUser.role ?? extracted?.role ?? null;
            mappedUser.branches = mappedUser.branches ?? (serverUser?.branches ?? []);
            mappedUser.departments = mappedUser.departments ?? (serverUser?.departments ?? []);
            mappedUser.divisions = mappedUser.divisions ?? (serverUser?.divisions ?? []);

            return { ok: true, data: { user: mappedUser, token: accessToken || (body?.token || null) } };
        } catch (error) {
            return { ok: false, error };
        }
    }, [loginMutation]);

    // -------------------------
    // LOGOUT
    // -------------------------
    const logoutMutation = useMutation({
        mutationFn: async () => {
            try {
                const res = await axiosRequester.post('/api/staff/auth/logout', {}, { withCredentials: true });
                return res.data || true;
            } catch (err) {
                throw err?.response?.data || err;
            }
        },
        onSuccess: () => {
            dispatch(logoutAction());
            qc.removeQueries(['auth', 'refresh']);
        },
        onError: () => {
            dispatch(logoutAction());
            qc.removeQueries(['auth', 'refresh']);
        },
    });

    const logout = useCallback(async (opts = { callApi: true }) => {
        // Support being used directly as an onClick handler (React passes MouseEvent as first arg)
        // If an event-like object is passed, treat it as a default server-logout call.
        if (opts && typeof opts.preventDefault === 'function') {
            opts = { callApi: true };
        }

        // default to contacting server to clear httpOnly refresh cookie/session
        if (opts.callApi) {
            try {
                await logoutMutation.mutateAsync();
                return { ok: true };
            } catch (err) {
                dispatch(logoutAction());
                qc.removeQueries(['auth', 'refresh']);
                return { ok: false, error: err };
            }
        } else {
            dispatch(logoutAction());
            qc.removeQueries(['auth', 'refresh']);
            return { ok: true };
        }
    }, [logoutMutation, dispatch, qc]);

    // -------------------------
    // REFRESH
    // -------------------------
    const refreshMutation = useMutation({
        mutationFn: async () => {
            try {
                const res = await axiosRequester.post('/api/staff/auth/refresh-token', {}, { withCredentials: true });
                return res.data;
            } catch (err) {
                throw err?.response?.data || err;
            }
        },
        onSuccess: (body) => {
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;
            const serverUser = body?.data && (Object.keys(body.data).length > 0) ? body.data : (body?.user || null);

            let mappedUser = null;
            if (serverUser) {
                try { mappedUser = mapUserRole(serverUser); } catch (e) { mappedUser = null; }
            } else if (accessToken) {
                const userObj = extractUserFromAccessToken(accessToken);
                mappedUser = userObj ? mapUserRole(userObj) : null;
            }

            // preserve existing user if backend didn't return user
            const existingUser = user || null;
            const finalUser = mappedUser || existingUser || null;

            dispatch(setCredentials({ user: finalUser, token: accessToken || body?.token || token }));
            try { qc.setQueryData(['auth', 'refresh'], finalUser); } catch (e) { }
        },
        onError: () => {
            dispatch(logoutAction());
            qc.removeQueries(['auth', 'refresh']);
        },
    });

    const refresh = useCallback(async () => {
        try {
            const body = await refreshMutation.mutateAsync();
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;
            const serverUser = body?.data && (Object.keys(body.data).length > 0) ? body.data : (body?.user || null);

            let mappedUser = null;
            if (serverUser) {
                try { mappedUser = mapUserRole(serverUser); } catch (e) { mappedUser = null; }
            } else if (accessToken) {
                const userObj = extractUserFromAccessToken(accessToken);
                mappedUser = userObj ? mapUserRole(userObj) : null;
            }

            // Preserve existing user if backend didn't return one
            const finalUser = mappedUser || user || null;

            // enrich finalUser with decoded email/role/branches if available
            let extracted = null;
            if (accessToken) extracted = extractUserFromAccessToken(accessToken);
            const enriched = finalUser || {};
            enriched.email = enriched.email ?? extracted?.email ?? null;
            enriched.role = enriched.role ?? extracted?.role ?? null;
            enriched.branches = enriched.branches ?? (serverUser?.branches ?? []);
            enriched.departments = enriched.departments ?? (serverUser?.departments ?? []);
            enriched.divisions = enriched.divisions ?? (serverUser?.divisions ?? []);

            dispatch(setCredentials({ user: enriched, token: accessToken || body?.token || token, email: enriched.email ?? extracted?.email ?? null }));
            return { ok: true };
        } catch (err) {
            return { ok: false, error: err };
        }
    }, [refreshMutation, user]);

    // -------------------------
    // setUser manual
    // -------------------------
    const setUserManual = useCallback((mappedUser) => {
        dispatch(setUser(mappedUser));
        try { qc.setQueryData(['auth', 'refresh'], mappedUser); } catch (e) { }
    }, [dispatch, qc]);

    // helpers
    const canView = useCallback((path) => {
        if (!user) return false;
        return canViewHelper(user, path);
    }, [user]);

    const canAct = useCallback((path) => {
        if (!user) return false;
        return canActHelper(user, path);
    }, [user]);

    const firstAllowedPath = useCallback(() => {
        if (!user) return '/';
        try {
            // accept several role identifiers that might come from backend mapping
            const roleCandidates = [
                user.roleId,
                user.role,
                user.roleKey,
                user?.role?.roleKey,
                user?.role?.id,
            ].filter(Boolean).map(String);

            // try to use precomputed maps for O(1) lookup
            const pm = getPermissionMaps();

            // iterate candidates and return first matching allowed path
            for (const rid of roleCandidates) {
                const set = pm?.roleToPaths?.get(rid) || null;
                if (set && set.size > 0) {
                    const arr = Array.from(set);
                    return arr.includes('/') ? '/' : arr[0];
                }
                // fallback to generator
                const paths = getPathsForRole(rid) || [];
                if (paths && paths.length > 0) return paths.includes('/') ? '/' : paths[0];
            }

            return '/';
        } catch (e) {
            return '/';
        }
    }, [user]);

    return {
        user,
        token,
        isAuthenticated,

        // actions
        login,
        loginStatus: { isLoading: loginMutation.isLoading, error: loginMutation.error },

        logout,
        logoutStatus: { isLoading: logoutMutation.isLoading, error: logoutMutation.error },

        refresh,
        refreshStatus: { isLoading: refreshMutation.isLoading, error: refreshMutation.error },

        setUser: setUserManual,

        canView,
        canAct,
        firstAllowedPath,
    };
}

export default useAuth;
