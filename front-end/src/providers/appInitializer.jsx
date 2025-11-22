'use client';

import { useEffect, useState } from 'react';
import { initializeApp } from '@/init/initializer';
import Loading from '@/app/loading';

export default function AppInitializer({ children }) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        initializeApp().finally(() => {
            if (mounted) setLoading(false);
        });

        return () => (mounted = false);
    }, []);

    if (loading) return <Loading />;

    return <>{children}</>;
}
