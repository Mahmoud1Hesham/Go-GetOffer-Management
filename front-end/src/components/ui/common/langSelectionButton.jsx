"use client";

import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { Button } from "@/components/ui/button.jsx";
import Cookies from "js-cookie";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PiGlobe } from "react-icons/pi";
export default function LanguageToggler() {
    const { i18n } = useTranslation();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || i18n.language || "ar";
    // Sync RTL on client
    useEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    }, [i18n.language]);

    // Toggle language
    const toggleLanguage = () => {
        const newLang = i18n.language === "en" ? "ar" : "en";

        // 1. Change i18next language
        i18n.changeLanguage(newLang);

        // 2. Save to cookies
        Cookies.set("Next-i18next", newLang, { expires: 365, path: "/" });

        // 3. Push new URL with lang param (مثلاً ?lang=ar أو ?lang=en)
        const url = `${pathname}?lang=${newLang}`;
        router.push(url);
    };

    return (
        <Button variant="outline" onClick={toggleLanguage} className={`shadow-none border-none font-semibold md:text-xs lg:text-sm  px-4 py-3 text-go-primary-g flex justify-center items-center `}>
            {lang === "en" ? "AR" : "EN"} <PiGlobe className="md:text-xs lg:text-sm " fontWeight={600} />
        </Button>
    );
}
