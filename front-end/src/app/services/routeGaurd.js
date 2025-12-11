"use client";

import LoginDialog from "@/components/ui/common/dialogs/loginDialog.jsx";
import NotAuthorized from "@/components/NotAuthorized.jsx";
import { usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { useSelector } from "react-redux";
import { selectRoleKey } from "@/redux/slices/authSlice";

// RouteGuard: shows `LoginDialog` when not authenticated,
// and `NotAuthorized` when the authenticated user cannot view the current path.
export default function RouteGuard({ children }) {
    const { isAuthenticated, canView ,firstAllowedPath } = useAuth();
    const selectRoleKeyValue = useSelector(selectRoleKey);
    const pathname = usePathname() || "/";

    // DEBUG: log auth state and requested pathname
    try { console.log('[RouteGuard] isAuthenticated=', isAuthenticated, 'pathname=', pathname); } catch(e){}

    if (!isAuthenticated) return <LoginDialog />;

    // log evaluated values (call functions) instead of printing function objects
    try {
        const canViewResult = typeof canView === 'function' ? canView(pathname) : Boolean(canView);
        const firstAllowed = typeof firstAllowedPath === 'function' ? firstAllowedPath() : firstAllowedPath;
        console.log(`[RouteGuard] role=${selectRoleKeyValue} isAuthenticated=${isAuthenticated} canView=${canViewResult} firstAllowedPath=${firstAllowed}`);
    } catch (e) {
        console.log('[RouteGuard] debug log error', e);
    }
    // if user is authenticated but not allowed to view this route
    if (!canView(pathname)) {
        try { console.log('[RouteGuard] canView=false for', pathname); } catch(e){}
        return <NotAuthorized />;
    }

    return <>{children}</>;
}
