import { createSlice } from "@reduxjs/toolkit";

/**
 * authSlice
 * - token stored in redux (access token)
 * - user: full mapped user object (must include roleId, divisionId, departmentId ideally)
 * - loading: boolean -> true while initializer/refresh running
 */

const initialState = {
    isAuthenticated: false,
    // canonical token stored here (mapped from API's accessToken)
    token: null,
    // user object contains mapped fields from API `data` (avatar, branches, departments, divisions, role, userId, username)
    user: null,
    // email extracted from JWT token payload (if present)
    email: null,
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            // Accept either legacy shape { user, token } or API response shape { data: { accessToken, ... } }
            const payload = action.payload || {};

            // If API response format (e.g. { status, message, data, errors })
            const apiData = payload.data || payload;

            const accessToken = apiData.accessToken || payload.token || null;

            // map user fields from API data if present
            const mappedUser = apiData && (apiData.userId || apiData.username || apiData.role || apiData.avatar)
                ? {
                    userId: apiData.userId ?? null,
                    username: apiData.username ?? null,
                    avatar: apiData.avatar ?? null,
                    branches: apiData.branches ?? [],
                    departments: apiData.departments ?? [],
                    divisions: apiData.divisions ?? [],
                    role: (apiData.role && (apiData.role.id ?? apiData.role)) ?? null,
                    roleKey: apiData.role?.roleKey ?? null,
                    branchId: apiData.branches?.[0]?.id ?? null,
                    branchName: apiData.branches?.[0]?.branchName ?? null,
                }
                : (payload.user || null);

            try { console.debug('[authSlice] setCredentials token?', !!accessToken, 'userHasRole?', !!(mappedUser && mappedUser.role && mappedUser.role.id)); } catch (_) {}

            // store token
            state.token = accessToken || null;
            state.isAuthenticated = !!accessToken;

            // overwrite user every time (not merge)
            state.user = mappedUser || null;

            // Prefer email provided explicitly in payload/api data, fall back to mapped user
            state.email = apiData?.emailAddress ?? apiData?.email ?? payload.email ?? (mappedUser?.email ?? null);

            // clear loading by default after setting credentials
            state.loading = false;
        },

        /**
       * setUser - update only the user object (caller should pass mapped user)
       */
        setUser: (state, action) => {
            // replace entire user object (caller should pass mapped user)
            state.user = action.payload ?? null;
        },

        /**
         * setAuthLoading(true|false) - global auth init / refresh state
         * used by initializer and RouteGuard to show loaders and prevent redirects.
         */
        setAuthLoading: (state, action) => {
            state.loading = !!action.payload;
            try { console.debug('[authSlice] setAuthLoading', !!action.payload); } catch (_) {}
        },

        /**
         * logout - clear everything to initialState
         */


        logout: (state) => {
            try { console.debug('[authSlice] logout'); } catch (_) {}
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.email = null;
            state.loading = false;
        },
    },
});

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => !!state.auth?.isAuthenticated;
export const selectToken = (state) => state.auth?.token;
export const selectAccessToken = (state) => state.auth?.token ?? null;
export const selectCurrentUser = (state) => state.auth?.user;
export const selectAvatar = (state) => state.auth?.user?.avatar ?? null;
export const selectBranches = (state) => state.auth?.user?.branches ?? [];
export const selectDepartments = (state) => state.auth?.user?.departments ?? [];
export const selectDivisions = (state) => state.auth?.user?.divisions ?? [];
export const selectRoleId = (state) => state.auth?.user?.role ?? null;
export const selectRoleKey = (state) => state.auth?.user?.role?.roleKey ?? state.auth?.user?.roleKey ?? null;
export const selectUserId = (state) => state.auth?.user?.userId ?? null;
export const selectUsername = (state) => state.auth?.user?.username ?? null;
export const selectAuthLoading = (state) => !!state.auth?.loading;
export const selectEmail = (state) => state.auth?.email ?? null;


export const { setCredentials, setUser, setAuthLoading, logout } = authSlice.actions;
const authReducer = authSlice.reducer;
export default authReducer;
