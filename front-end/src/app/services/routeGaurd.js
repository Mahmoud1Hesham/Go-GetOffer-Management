'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getPathsForRole } from '@/services/maps/pathsMap'; 
import { canView } from './workers/pathHelpers.worker.js';

export default function RouteGuard({ children, fallback = '/not-authorized' }) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useSelector(s => s.auth.user); // user must contain roleId, divisionId, departmentId
    const [ready, setReady] = useState(false);

    useEffect(() => {
        // wait until pathname available (client navigation)
        if (!pathname) return;
        // if no user => redirect to login
        if (!user) {
            router.replace('/login');
            return;
        }

        // if user is allowed to view this path -> render children
        const allowed = canView(user, pathname);
        if (allowed) {
            setReady(true);
            return;
        }

        // not allowed -> try redirect to first allowed path for this role
        const roleId = user.roleId;
        try {
            const allowedPaths = getPathsForRole(roleId) || [];
            if (Array.isArray(allowedPaths) && allowedPaths.length > 0) {
                // choose first allowed path (prefer dashboard root if present)
                const prefer = allowedPaths.includes('/') ? '/' : allowedPaths[0];
                router.replace(prefer);
                return;
            }
        } catch (err) {
            // fallback
        }

        // else go to not-authorized
        router.replace(fallback);
    }, [pathname, user, router]);

    // render null until ready to avoid flicker
    if (!ready) return null; //user loader when available
    return <>{children}</>;
}
