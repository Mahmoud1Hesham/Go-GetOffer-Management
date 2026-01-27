import { NextResponse } from 'next/server'
import acceptLanguage from 'accept-language'

const languages = ['en', 'ar']
const defaultLanguage = 'ar'

acceptLanguage.languages(languages)

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|_static|images|favicon.ico).*)',
        '/:lng*'
    ]
}

export function languageDetector(req) {
    let lng
    if (req.cookies.has('Next-i18next')) {
        lng = acceptLanguage.get(req.cookies.get('Next-i18next').value)
    }
    if (!lng) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
    if (!lng) lng = defaultLanguage

    if (
        !languages.some(loc => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
        !req.nextUrl.pathname.startsWith('/_next')
    ) {
        return NextResponse.redirect(new URL(`/${lng}${req.nextUrl.pathname}`, req.url))
    }

    if (req.headers.has('referer')) {
        const refererUrl = new URL(req.headers.get('referer'))
        const lngInReferer = languages.find((l) => refererUrl.pathname.startsWith(`/${l}`))
        const response = NextResponse.next()
        if (lngInReferer) response.cookies.set('Next-i18next', lngInReferer)
        return response
    }

    return NextResponse.next()
}
