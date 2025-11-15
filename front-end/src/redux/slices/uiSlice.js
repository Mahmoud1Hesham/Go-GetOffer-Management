import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
    name: "ui",
    initialState: {
        isLoginPopupOpen: false,
        sidebarCollapsed: false,
        selectedBranch: null,
    },
    reducers: {
        setLoginPopup: (state, action) => {
            state.isLoginPopupOpen = action.payload;
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },
        setBranch: (state, action) => {
            state.selectedBranch = action.payload;
        },
    },
});

export const { setLoginPopup, setSidebarCollapsed, setBranch } = uiSlice.actions;
const uiReducer = uiSlice.reducer
export default uiReducer;
