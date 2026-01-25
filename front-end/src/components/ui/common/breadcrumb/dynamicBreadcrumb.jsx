'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Spinner from '../../../../../public/assets/illustrations/Spinner.json'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

export default function DynamicBreadcrumb({
    enLabelsMap = {},
    arLabelsMap = {},
    dynamicLabels = {},
    SpinnerComponent = Spinner,
    lang = "en",        // << اللغة الافتراضية
    homeLabelEn = "Home",
    homeLabelAr = "الرئيسية",
    showHome = true,
    className = '',
    // segments that should be shown as plain text (not links). default contains requested ones
    nonLinkSegments = ['divisions', 'management'],
}) {
    const pathname = usePathname() || '/'

    const labelsMap = lang === "ar" ? arLabelsMap : enLabelsMap
    const homeLabel = lang === "ar" ? homeLabelAr : homeLabelEn

    const segments = useMemo(() => {
        if (pathname === '/') return []
        return pathname.split('/').filter(Boolean)
    }, [pathname])

    const crumbs = useMemo(() => {
        const arr = []
        let acc = ''
        if (showHome) {
            arr.push({ href: '/', label: homeLabel, isLast: segments.length === 0 })
        }
        segments.forEach((seg, i) => {
            acc = acc + '/' + seg
            arr.push({
                href: acc,
                segment: seg,
                index: i,
                isLast: i === segments.length - 1,
            })
        })
        return arr
    }, [segments, homeLabel, showHome])

    const nonLinkSet = useMemo(() => new Set((nonLinkSegments || []).map(s => String(s).toLowerCase())), [nonLinkSegments])

    // normalize paths (remove trailing slashes) for exact comparison
    const normalize = (p) => {
        if (!p) return ''
        if (p === '/') return '/'
        return p.replace(/\/+$|\/+$/g, '')
    }

    function findLabelForHref(href, segment) {
        if (labelsMap[href]) return { label: labelsMap[href] }

        const keys = Object.keys(labelsMap)
        for (const key of keys) {
            if (!key.includes('[')) continue
            const keyParts = key.split('/').filter(Boolean)
            const hrefParts = href.split('/').filter(Boolean)
            if (keyParts.length !== hrefParts.length) continue
            let matched = true
            const params = {}
            for (let i = 0; i < keyParts.length; i++) {
                if (keyParts[i].startsWith('[')) {
                    const name = keyParts[i].slice(1, -1)
                    params[name] = hrefParts[i]
                } else if (keyParts[i] !== hrefParts[i]) {
                    matched = false
                    break
                }
            }
            if (matched) return { label: labelsMap[key], patternKey: key, params }
        }
        return { label: prettify(segment) }
    }

    function prettify(s) {
        if (!s) return ''
        const text = s.replace(/[-_]/g, ' ')
        return text.replace(/\b\w/g, c => c.toUpperCase())
    }

    return (
        <div className={className}>
            <Breadcrumb lang={lang}>
                <BreadcrumbList>
                    {crumbs.map((c, idx) => {
                        const currentPath = normalize(pathname)
                        const hrefPath = normalize(c.href)
                        const isExactMatch = hrefPath === currentPath
                        const isNonLinkSegment = !!(c.segment && nonLinkSet.has(String(c.segment).toLowerCase()))
                        const found = findLabelForHref(c.href, c.segment)
                        let label = found.label
                        let showSpinner = false

                        if (found.patternKey) {
                            if (dynamicLabels && dynamicLabels[c.href]) {
                                label = dynamicLabels[c.href]
                            } else if (SpinnerComponent) {
                                showSpinner = true
                            } else {
                                label = found.label || prettify(c.segment)
                            }
                        }

                        return (
                            <React.Fragment key={`bc-${idx}-${c.href}`}>
                                <BreadcrumbItem>
                                    {(c.isLast || isExactMatch || isNonLinkSegment) ? (
                                        // For non-link segments we still want to show a tooltip on hover.
                                        isNonLinkSegment ? (
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <BreadcrumbPage>
                                                        {showSpinner ? <Spinner/> : label}
                                                    </BreadcrumbPage>
                                                </TooltipTrigger>
                                                <TooltipContent side="bottom">
                                                    {label}
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : (
                                            <BreadcrumbPage>
                                                {showSpinner ? <Spinner/> : label}
                                            </BreadcrumbPage>
                                        )
                                    ) : (
                                        <BreadcrumbLink asChild>
                                            <Link href={c.href}>
                                                {showSpinner ? <Spinner/> : label}
                                            </Link>
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>

                                {!c.isLast && <BreadcrumbSeparator lang={lang} />}
                            </React.Fragment>
                        )
                    })}
                </BreadcrumbList>
            </Breadcrumb>
        </div>
    )
}
