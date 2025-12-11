"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { useLottieAnimation } from "@/hooks/useLottieAnimation";

import thumbsUp from "../../../../../public/assets/illustrations/thumbsUp.json";
import highFive from "../../../../../public/assets/illustrations/highFive.json";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { getCallback, removeCallback } from '@/lib/modalCallbacks';
import useAuth from "@/hooks/useAuth";
import Lottie from "lottie-react";
import { useTranslation } from "react-i18next";


export const modalIllustrations = {
    "thumbs": thumbsUp,
    "high": highFive,
};

export default function GlobalModal() {
    const { modal, closeModal } = useModal();
    const pathname = usePathname();
    const router = useRouter();
    const { refresh, firstAllowedPath, logout } = useAuth();
    const { i18n } = useTranslation();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || (i18n && i18n.language) || "en";

    const {
        isOpen,
        type,
        title,
        message,
        image,
        illustration,
        actionType,
        customActionKey,
        actionName,
        cancelActionKey,
        cancelTitle,
        out = false,
    } = modal || {};

    const typeStyles = {
        default: { border: "border-go-primary-e", text: "text-go-primary-e", backGround: "bg-go-primary-e", hoverBackGround: "hover:bg-go-primary-e" },
        success: { border: "border-green-600", text: "text-green-600", backGround: "bg-green-600", hoverBackGround: "hover:bg-green-600" },
        failure: { border: "border-go-primary-cancel", text: "text-go-primary-cancel", backGround: "bg-go-primary-cancel", hoverBackGround: "hover:bg-go-primary-cancel" },
        warning: { border: "border-yellow-600", text: "text-yellow-600", backGround: "bg-green-600", hoverBackGround: "hover:bg-green-600" },
    };
    const modalActionsMap = {
        ROLE_SELECT: () => router.push("/role-select"),
        LOGIN: () => router.push("/login"),
        RESET_PASSWORD: () => router.push("/forget-otp-verify"),
        AFTER_OTP_SUCCESS: async () => {
            await refresh()
            router.push("/role-select");
        },
        ALLOWED_PAGE: () => {
            const target = typeof firstAllowedPath === 'function' ? firstAllowedPath() : '/';
            try { console.debug('[GlobalModal] navigating to allowed path:', target); } catch (e) { }
            router.push(target);
        }
    };


    // 🔹 Handle Confirm
    const handleConfirm = () => {
        const cb = customActionKey ? getCallback(customActionKey) : null;
        if (typeof cb === "function") {
            try { cb(); } finally { removeCallback(customActionKey); }
        } else if (actionType && modalActionsMap[actionType]) {
            modalActionsMap[actionType]();
        }
        try { closeModal(pathname); } catch (e) { closeModal(); }
    };
    // 🔹 Handle Cancel
    const handleCancel = () => {
        const cancelCb = cancelActionKey ? getCallback(cancelActionKey) : null;
        if (typeof cancelCb === "function") {
            try { cancelCb(); } finally { removeCallback(cancelActionKey); }
        }
        try { closeModal(pathname); } catch (e) { closeModal(); }
    };

    return (
        <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) { try { closeModal(pathname); } catch (e) { closeModal(); } } }}>
            <DialogContent
                className={`
                        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        bg-white rounded-2xl shadow-lg w-full sm:max-w-sm md:max-w-md
                        animate-in fade-in-0 zoom-in-95
                        data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
                        ${type ? typeStyles[type]?.border : ""}`}>
                <DialogHeader className={`flex flex-col ${lang === 'en' ? "sm:text-left text-left" : "sm:text-right text-right"}`}>
                    {title && (
                        <DialogTitle
                            className={`text-2xl font-bold ${typeStyles[type]?.text || "text-black"
                                }`}
                        >
                            {title}
                        </DialogTitle>
                    )}
                    {message && (
                        <DialogDescription className="text-lg">
                            {message}
                        </DialogDescription>
                    )}
                </DialogHeader>

                {/* image if exists */}
                {image && (
                    <img
                        src={image}
                        alt={type || "modal-image"}
                        className="w-16 h-16 object-contain"
                    />
                )}

                {/* illustration if exists */}
                {illustration && (
                    <div className="mx-auto h-64 w-64">
                        <Lottie animationData={modalIllustrations[illustration]} loop={true} autoplay={true} />
                    </div>
                )}

                <DialogFooter className="flex justify-center gap-2">
                    {cancelTitle && (
                        <Button variant="outline" onClick={handleCancel} className={``}>
                            {cancelTitle}
                        </Button>
                    )}
                    {/* Optional logout button: shown when actionName matches 'logout' or Arabic 'تسجيل الخروج' */}
                    {out && (
                        <Button variant="outline" onClick={()=> { logout(); try { closeModal(pathname); } catch (e) { closeModal(); } }} className={`w-full bg-white hover:text-white ${typeStyles[type]?.text}  ${typeStyles[type]?.border} ${typeStyles[type]?.hoverBackGround}`}>
                            {lang === 'en' ? 'Logout' : 'تسجيل الخروج'}
                        </Button>
                    )}
                    <Button variant={'outline'} className={`w-full bg-white hover:text-white ${typeStyles[type]?.text}  ${typeStyles[type]?.border} ${typeStyles[type]?.hoverBackGround}`} onClick={handleConfirm}>{actionName}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
