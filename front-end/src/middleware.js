import { i18nMiddleware } from "./middlewares/localization.middleware.js";
import { NextResponse } from "next/server";
// import maintenanceMiddleware from "./middlewares/maintenance.middleware";

export function middleware(req) {
    const i18nResponse = i18nMiddleware(req);
    if (i18nResponse) return i18nResponse;

    // const maintenanceResponse = maintenanceMiddleware(req);
    // if (maintenanceResponse) return maintenanceResponse;


    return NextResponse.next();
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/` routes
    matcher: [
        /*
         * Match all request paths except for:
         * 1. /api/ (API routes)
         * 2. /_next/ (Next.js internals)
         * 3. /_static (inside /public)
         * 4. /images (inside /public)
         * 5. /favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|_static|images|favicon.ico).*)',
        '/:lng*'
    ]
}
