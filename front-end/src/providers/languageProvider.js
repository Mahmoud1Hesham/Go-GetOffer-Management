'use client';

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import i18n from "../lib/i18next/i18next.js";

export default function LanguageProvider({ children, defaultLang }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const cookieLang = Cookies.get("Next-i18next") || defaultLang; 
        if (i18n.language !== cookieLang) {
            i18n.changeLanguage(cookieLang);
        }
        setMounted(true);
    }, [defaultLang]);

    // منع أي mismatch render قبل mount
    if (!mounted) return null;

    return <>{children}</>;
}
