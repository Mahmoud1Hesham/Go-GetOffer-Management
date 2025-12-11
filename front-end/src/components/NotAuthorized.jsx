"use client";

import { useModal } from "@/hooks/useModal";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";

export default function NotAuthorized() {
    const { openModal, modal } = useModal();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { firstAllowedPath, isAuthenticated } = useAuth();
    const pathname = usePathname() || '/';
    const lang = (searchParams && searchParams.get && searchParams.get("lang")) || (typeof i18n !== 'undefined' && i18n?.language) || "ar";

    // open modal as a side-effect; do not render the return value of openModal
    useEffect(() => {
        // Only open the modal when the user is still authenticated and
        // when a modal is not already open. This prevents the modal from
        // re-opening after the user clicks logout while NotAuthorized
        // might briefly still be mounted during state transitions.
        if (!isAuthenticated) return;
        // Avoid reopening if the modal was closed very recently for the same path
        const recentlyClosed = modal?.lastClosedAt && (Date.now() - modal.lastClosedAt < 500);
        const closedForSamePath = modal?.lastClosedForPath && (modal.lastClosedForPath === pathname || modal.lastClosedForPath === '__GLOBAL__');
        if (modal?.isOpen || (recentlyClosed && closedForSamePath)) return;
        if (typeof openModal === 'function') {
            console.debug('[NotAuthorized] calling openModal');
            openModal({
                type: "failure",
                title: lang === 'en' ? "Not Authorized" : "غير مصرح",
                message: lang === 'en' ? "You are not authorized to view this page." : "أنت غير مخول لعرض هذه الصفحة.",
                actionName: lang === 'en' ? 'Go to your Allowed Page' : 'الذهاب إلى الصفحة المسموح بها',
                actionType: 'ALLOWED_PAGE',
                illustration: 'high',
                out: true,
            });
        }
    }, [openModal, lang, isAuthenticated, modal, pathname]);
}
