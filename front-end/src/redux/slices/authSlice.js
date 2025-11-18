// src/store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isAuthenticated: false,
    token: null,
    user: null, // must contain roleId, divisionId, departmentId (after mapping)
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
        },

        setUser: (state, action) => {
            state.user = action.payload; // full mapped user
        },

        logout: (state) => {
            state.isAuthenticated = false;
            state.token = null;
            state.user = null;
        },
    },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
const authReducer = authSlice.reducer;
export default  authReducer;
