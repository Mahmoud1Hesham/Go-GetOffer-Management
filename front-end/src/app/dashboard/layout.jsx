import { SidebarRunner } from "@/components/ui/common/sideBarRunner.jsx";

export default function DashboardLayout({ children }) {
    return (
        <main className="w-full">
            <SidebarRunner>
                {children}
            </SidebarRunner>
        </main>
    );
}
