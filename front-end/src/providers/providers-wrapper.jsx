'use client';

import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RouteGuard from "@/app/services/routeGaurd.js";
import GlobalModal from "@/components/ui/common/modal/customizableModal";
import AppInitializer from "@/providers/appInitializer.jsx";
import ErrorBoundary from '@/components/ErrorBoundary.jsx';

const queryClient = new QueryClient();

export default function Providers({ children }) {




    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                <ErrorBoundary>
                    <AppInitializer>
                        <GlobalModal />
                        <RouteGuard>
                            {children}
                        </RouteGuard>
                    </AppInitializer>
                </ErrorBoundary>
            </QueryClientProvider>
        </ReduxProvider>
    );
}
