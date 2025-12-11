"use client";

import { useDispatch, useSelector } from "react-redux";
import { openModal, closeModal } from "@/redux/slices/modalSlice";

// custom hook
export function useModal() {
    const dispatch = useDispatch();
    const modal = useSelector((state) => state.modal);

    const handleOpen = (payload) => dispatch(openModal(payload));
    const handleClose = (forPath = null) => dispatch(closeModal({ forPath }));

    return { modal, openModal: handleOpen, closeModal: handleClose };
}



export const ModalActions = {
    NONE: "NONE",
    RESET_PASSWORD: "RESET_PASSWORD",
    LOGIN: "LOGIN",
    DASHBOARD: "DASHBOARD",
    CLOSE: "CLOSE",
    ROLE_SELECT: "ROLE_SELECT"
};
