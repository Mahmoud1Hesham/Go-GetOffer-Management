'use client';

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { jwtDecode } from 'jwt-decode';
import { setCredentials, setUser, logout as logoutAction } from '@/redux/slices/authSlice.js';
import { mapUserRole } from '@/app/services/workers/userRoleMapper.js';
import { canView as canViewHelper, canAct as canActHelper } from '@/app/services/workers/pathHelpers.worker.js';
import { getPathsForRole } from '@/app/services/maps/appPathsStructure.map.js';

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
            const url = API_BASE ? `${API_BASE}/api/staff/auth/login` : '/api/staff/auth/login';
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                credentials: 'include',
            });

            // parse JSON body (server returns wrapper)
            const body = await res.json().catch(() => null);
            if (!res.ok) {
                // throw server error object (if any) so caller can inspect
                throw body || { message: 'Login failed' };
            }
            return body;
        },
        onSuccess: (body) => {
            // expected shape: { status: true, message: '...', data: { accessToken: '...' }, errors: null }
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;
            if (!accessToken) {
                // fallback: if backend returned direct user/token shape
                const mappedUser = body?.user ? mapUserRole(body.user) : null;
                const tokenVal = body?.token || body?.accessToken || null;
                dispatch(setCredentials({ user: mappedUser, token: tokenVal }));
                try { qc.setQueryData(['auth', 'refresh'], mappedUser); } catch (e) { }
                return;
            }

            const userObj = extractUserFromAccessToken(accessToken);
            const mappedUser = userObj ? mapUserRole(userObj) : null;

            dispatch(setCredentials({ user: mappedUser, token: accessToken }));
            try { qc.setQueryData(['auth', 'refresh'], mappedUser); } catch (e) { }
        },
        onError: (err) => {
            console.error('login error', err);
        },
    });

    const login = useCallback(async (payload) => {
        try {
            const body = await loginMutation.mutateAsync(payload);
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;

            if (!accessToken) {
                // maybe backend returned direct user+token
                const mappedUser = body?.user ? mapUserRole(body.user) : null;
                return { ok: true, data: { user: mappedUser, token: body?.token || null } };
            }

            const userObj = extractUserFromAccessToken(accessToken);
            const mappedUser = userObj ? mapUserRole(userObj) : null;

            return { ok: true, data: { user: mappedUser, token: accessToken } };
        } catch (error) {
            return { ok: false, error };
        }
    }, [loginMutation]);

    // -------------------------
    // LOGOUT
    // -------------------------
    const logoutMutation = useMutation({
        mutationFn: async () => {
            const url = API_BASE ? `${API_BASE}/api/staff/auth/logout` : '/api/staff/auth/logout';
            const res = await fetch(url, { method: 'POST', credentials: 'include' });
            return res.ok;
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

    const logout = useCallback(async (opts = { callApi: false }) => {
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
            // note: some backends use GET, some POST — adjust if needed
            const url = API_BASE ? `${API_BASE}/api/staff/auth/refresh-token` : '/api/staff/auth/refresh-token';
            const res = await fetch(url, { method: 'POST', credentials: 'include' });
            const body = await res.json().catch(() => null);
            if (!res.ok) throw body || { message: 'Refresh failed' };
            return body;
        },
        onSuccess: (body) => {
            const accessToken = body?.data?.accessToken || body?.access_token || body?.token || null;
            if (accessToken) {
                const userObj = extractUserFromAccessToken(accessToken);
                const mappedUser = userObj ? mapUserRole(userObj) : null;
                dispatch(setCredentials({ user: mappedUser, token: accessToken || token }));
                try { qc.setQueryData(['auth', 'refresh'], mappedUser); } catch (e) { }
                return;
            }

            // fallback: backend returned user directly
            if (body?.user) {
                const mappedUser = mapUserRole(body.user);
                dispatch(setCredentials({ user: mappedUser, token: body?.token || token }));
                try { qc.setQueryData(['auth', 'refresh'], mappedUser); } catch (e) { }
            }
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
            if (!accessToken) return { ok: true, data: null };

            const userObj = extractUserFromAccessToken(accessToken);
            const mapped = userObj ? mapUserRole(userObj) : null;
            return { ok: true, data: mapped };
        } catch (err) {
            return { ok: false, error: err };
        }
    }, [refreshMutation]);

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
        if (!user || !user.roleId) return '/';
        try {
            const paths = getPathsForRole(user.roleId) || [];
            if (!paths || paths.length === 0) return '/';
            return paths.includes('/') ? '/' : paths[0];
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
