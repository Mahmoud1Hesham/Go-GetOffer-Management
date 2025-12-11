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
    actionName: null,
    cancelActionKey: null,
    cancelTitle: null,
    // timestamp (ms) when modal was last closed; used to prevent immediate reopen races
    lastClosedAt: null,
    // the path for which the modal was last closed (if applicable)
    lastClosedForPath: null,
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
            // optional flags (e.g., show logout button)
            state.out = typeof action.payload.out !== 'undefined' ? action.payload.out : false;
            // clear any recently-closed marker when opening
            state.lastClosedAt = null;
        },
        closeModal: (state, action) => {
            const forPath = action && action.payload ? action.payload.forPath || null : null;
            // if no explicit path given, mark as global close to prevent immediate reopen during auth transitions
            const marker = forPath || '__GLOBAL__';
            return { ...initialState, lastClosedAt: Date.now(), lastClosedForPath: marker };
        }, // reset everything but mark lastClosedAt and lastClosedForPath
    },
});

export const { openModal, closeModal } = modalSlice.actions;
export const modalReducer = modalSlice.reducer;
