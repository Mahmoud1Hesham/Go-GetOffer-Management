import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"


export function SidebarRunner({ children }) {
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <aside className="w-72">
                    <AppSidebar />
                </aside>

                <SidebarInset>
                    {children}
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
