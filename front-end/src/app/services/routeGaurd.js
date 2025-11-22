'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { getPathsForRole } from '@/app/services/maps/appPathsStructure.map.js';
import { canView } from './workers/pathHelpers.worker.js';
import LoginDialog from '@/components/ui/common/loginDialog.jsx';
import Loading from '../loading.jsx';

export default function RouteGuard({ children, fallback = '/not-authorized' }) {
    const router = useRouter();
    const pathname = usePathname();
    const user = useSelector(s => s.auth.user); // user must contain roleId, divisionId, departmentId
    const [ready, setReady] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        process.env.NEXT_PUBLIC_MOOD === 'DEV' ? console.log(user, pathname) : null;
        if (!pathname) return;

        // لو مفيش user نعرض مودال/كونپوننت تسجيل الدخول
        if (!user) {
            setShowLoginPrompt(true);
            setReady(false);
            return;
        }
        // لو في user، اتأكد إنه مسموح يدخل الصفحة
        const allowed = canView(user, pathname);
        if (allowed) {
            setShowLoginPrompt(false);
            setReady(true);
            return;
        }

        // لو مش مسموح -> حاول ترجع لأول مسار مسموح لدورته
        const roleId = user.roleId;
        try {
            const allowedPaths = getPathsForRole(roleId) || [];
            if (Array.isArray(allowedPaths) && allowedPaths.length > 0) {
                const prefer = allowedPaths.includes('/') ? '/' : allowedPaths[0];
                router.replace(prefer);
                return;
            }
        } catch (err) {
            // ignore
        }

        // لو مفيش مسار مسموح -> redirect للـ fallback
        router.replace(fallback);
    }, [pathname, user, router, fallback]);

    // لو بنعرض login prompt رجّع الكومبوننت مباشرة
    if (showLoginPrompt && !user) {
        return <LoginDialog />;
    }

    // لو لسه مش جاهز متعرضش حاجة (أو اعرض لودر)
    if (!ready) return <Loading/>;

    return <>{children}</>;
}
