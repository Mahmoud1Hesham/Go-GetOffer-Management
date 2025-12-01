'use client'
import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { arLabels, enLabels } from "@/app/services/maps/breadcrumbMaps.js"
import DynamicBreadcrumb from "./breadcrumb/dynamicBreadcrumb.jsx"
import { useSearchParams } from "next/navigation.js"


export function SidebarRunner({ children }) {
    const searchParams = useSearchParams()
    const lang = searchParams.get("lang") || (typeof i18n !== 'undefined' && i18n?.language) || "ar"

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full">
                <AppSidebar />

                <SidebarInset>
                    <div className="flex items-center gap-2 px-4 py-5">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <DynamicBreadcrumb
                            lang={lang}                          // << غيرها لـ "en" لو عايز انجليزي
                            enLabelsMap={enLabels}
                            arLabelsMap={arLabels}
                            dynamicLabels={''}
                            SpinnerComponent={''}
                        />
                    </div>

                    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                        {children}
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
