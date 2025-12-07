import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isOpen: false,
    type: "",
    title: "",
    message: "",
    image: null,
    actionType: null,
    confirmAction: null,
    customActionKey: null,
    actionName:null,
    cancelActionKey: null,
    cancelTitle:null,
};

const modalSlice = createSlice({
    name: "modal",
    initialState,
    reducers: {
        openModal: (state, action) => {
            state.isOpen = true;
            state.type = action.payload.type || "";
            state.title = action.payload.title || "";
            state.message = action.payload.message || "";
            state.image = action.payload.image || null;
            state.illustration = action.payload.illustration || null;
            state.actionType = action.payload.actionType || null;
            state.actionName = action.payload.actionName || "";
            // support passing callback keys (strings) that reference non-serializable callbacks
            state.customActionKey = action.payload.customActionKey || null;
            state.cancelActionKey = action.payload.cancelActionKey || null;
            state.cancelTitle = action.payload.cancelTitle || "";
        },
        closeModal: () => initialState, // reset everything
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;
