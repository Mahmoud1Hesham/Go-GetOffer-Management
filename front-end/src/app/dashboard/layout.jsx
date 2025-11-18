import RouteGuard from "../services/routeGaurd.js";

export default function DashboardLayout({ children }) {
    return (
        <div className="flex">
            <aside className="w-64 bg-gray-200">
                Sidebar placeholder
            </aside>
            <main className="flex-1">
                <RouteGuard>
                {children}  
                </RouteGuard>
            </main>
        </div>
    );
}
