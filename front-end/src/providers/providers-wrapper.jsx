'use client';

import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store.js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import RouteGuard from "@/app/services/routeGaurd.js";

const queryClient = new QueryClient();

export default function Providers({ children }) {
    return (
        <ReduxProvider store={store}>
            <QueryClientProvider client={queryClient}>
                {/* <RouteGuard> */}
                    {children}
                {/* </RouteGuard> */}
            </QueryClientProvider>
        </ReduxProvider>
    );
}
