// src/hooks/useAuth.js
'use client';

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials, setUser, logout as logoutAction } from '@/store/authSlice';
import { mapUserRole } from '@/helpers/userRoleMapper';
import { canView as canViewHelper, canAct as canActHelper } from '@/helpers/accessHelpers';
import { getPathsForRole } from '@/config/pathsMap';

export function useAuth() {
    const dispatch = useDispatch();
    const auth = useSelector(s => s.auth);
    const user = auth?.user || null;
    const token = auth?.token || null;
    const isAuthenticated = Boolean(auth?.isAuthenticated);

    // login: call your backend, map role -> division/department then persist
    // NOTE: replace fetch URLs with your real endpoints and handle errors accordingly.
    const login = useCallback(async (credentials) => {
        // credentials: { username, password } or whatever your API expects
        // return object: { ok: boolean, data?, error? }
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ message: 'Login failed' }));
                return { ok: false, error: err };
            }

            const payload = await res.json();
            // expected payload: { user: { id, name, role }, token: '...' }
            const mappedUser = mapUserRole(payload.user);

            dispatch(setCredentials({ user: mappedUser, token: payload.token }));
            return { ok: true, data: { user: mappedUser, token: payload.token } };
        } catch (error) {
            return { ok: false, error };
        }
    }, [dispatch]);

    // logout: clear store and optionally call backend to invalidate token
    const logout = useCallback(async (opts = { callApi: false }) => {
        try {
            if (opts.callApi) {
                try {
                    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
                } catch (e) {
                    // ignore network error for logout
                }
            }
        } finally {
            dispatch(logoutAction());
        }
    }, [dispatch]);

    // refreshMe: fetch /auth/me and update user (useful on 403 or token refresh)
    const refreshMe = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me', { credentials: 'include' });
            if (!res.ok) {
                // if unauthorized, clear auth
                dispatch(logoutAction());
                return { ok: false };
            }
            const payload = await res.json(); // expect { user: { id, role, ... }, token? }
            const mappedUser = mapUserRole(payload.user);
            // if backend returns token, you may update it
            dispatch(setCredentials({ user: mappedUser, token: payload.token || token }));
            return { ok: true, data: mappedUser };
        } catch (err) {
            return { ok: false, error: err };
        }
    }, [dispatch, token]);

    // setUser manually (mapped user) if you need to update parts of user from UI
    const setUserManual = useCallback((mappedUser) => {
        dispatch(setUser(mappedUser));
    }, [dispatch]);

    // helpers that delegate to accessHelpers; they expect `user` to contain roleId/divisionId/departmentId
    const canView = useCallback((path) => {
        if (!user) return false;
        return canViewHelper(user, path);
    }, [user]);

    const canAct = useCallback((path) => {
        if (!user) return false;
        return canActHelper(user, path);
    }, [user]);

    // firstAllowedPath for redirecting after login
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
        logout,
        refreshMe,
        setUser: setUserManual,

        // access helpers
        canView,
        canAct,
        firstAllowedPath,
    };
}

export default useAuth;
