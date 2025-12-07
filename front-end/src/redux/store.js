import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import uiReducer from "./slices/uiSlice.js";
import { modalReducer } from "./slices/modalSlice.js";


export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    modal: modalReducer,
  },
});
