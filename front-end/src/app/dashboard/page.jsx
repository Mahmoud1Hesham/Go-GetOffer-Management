"use client";
import { useDispatch, useSelector } from "react-redux";
import { setSidebarCollapsed } from "@/redux/slices/uiSlice";
import { Button } from "@/components/ui/button.jsx";
import LanguageToggler from "@/components/ui/common/langSelectionButton.jsx";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation.js";

export default function DashboardPage() {
    const dispatch = useDispatch();
    const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
    const { t, i18n } = useTranslation(["test"]);
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || i18n.language || "en";
    return (
        <main className="p-6">
            <LanguageToggler />
            <h1 className="text-2xl">{t('title')}</h1>
            <Button
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => dispatch(setSidebarCollapsed(!collapsed))}
            >
                {t('toggle')} {collapsed ? "Collapsed" : "Expanded"}
            </Button>
        </main>
    );
}
