'use client'
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// ✅ Translation files
import enTest from '../../localization/en/test.json'
import arTest from '../../localization/ar/test.json'
import enSideBar from '../../localization/en/sideBar.json'
import arSideBar from '../../localization/ar/sideBar.json'
import enValidation from '@/localization/en/errors/validation/validation.json'
import arValidation from '@/localization/ar/errors/validation/validation.json'

// Helper: update direction
const updateHtmlDirection = (lng) => {
    if (typeof document !== "undefined") {
        document.documentElement.lang = lng;
        document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                test:enTest,sideBar:enSideBar, validation: enValidation,
            },
            ar: {
                test:arTest,sideBar:arSideBar, validation: arValidation,
            }
        },
        fallbackLng: "ar",
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ["cookie", "htmlTag", "localStorage", "navigator"],
            caches: ["cookie"],
            lookupCookie: "Next-i18next", // Changed to match i18next's default
            cookieName: "Next-i18next", // Changed to match i18next's default
            cookieMinutes: 60 * 24 * 30,
        },
    });

// ✅ Sync direction initially + on language change
updateHtmlDirection(i18n.language);
i18n.on("languageChanged", updateHtmlDirection);

export default i18n;
