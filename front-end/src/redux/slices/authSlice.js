import { createSlice } from "@reduxjs/toolkit";

/**
 * authSlice
 * - token stored in redux (access token)
 * - user: full mapped user object (must include roleId, divisionId, departmentId ideally)
 * - loading: boolean -> true while initializer/refresh running
 */

const initialState = {
    isAuthenticated: false,
    token: null,
    user: null, // must contain roleId, divisionId, departmentId (after mapping)
    loading: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;

            state.token = token || null;
            state.isAuthenticated = !!token;

            // overwrite user every time (not merge)
            state.user = user || null;
            // clear loading by default after setting credentials
            state.loading = false;
        },

        /**
       * setUser - update only the user object (caller should pass mapped user)
       */
        setUser: (state, action) => {
            state.user = action.payload ?? null;
        },

        /**
         * setAuthLoading(true|false) - global auth init / refresh state
         * used by initializer and RouteGuard to show loaders and prevent redirects.
         */
        setAuthLoading: (state, action) => {
            state.loading = !!action.payload;
        },

        /**
         * logout - clear everything to initialState
         */


        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
            state.loading = false;
        },
    },
});

export const selectAuth = (state) => state.auth;
export const selectIsAuthenticated = (state) => !!state.auth?.isAuthenticated;
export const selectToken = (state) => state.auth?.token;
export const selectCurrentUser = (state) => state.auth?.user;
export const selectAuthLoading = (state) => !!state.auth?.loading;


export const { setCredentials, setUser, setAuthLoading, logout } = authSlice.actions;
const authReducer = authSlice.reducer;
export default authReducer;
