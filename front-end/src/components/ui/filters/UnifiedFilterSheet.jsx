"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { activities as activitiesExport } from '@/utils/interfaces/activities'
import Calendar04 from '@/components/calendar-04'
import { parseDate, formatDate } from '@/components/ui/filters/filter.service'

export default function UnifiedFilterSheet({
    open,
    onOpenChange,
    categories = [],
    initial = {},
    onApply,
    showCategories = true,
    showDate = true,
    showStatus = true
}) {
    // use shared parse/format helpers to avoid UTC shift bugs
    const parseLocalDate = (s) => parseDate(s)
    const formatLocalDate = (d) => formatDate(d)

    const [local, setLocal] = useState({
        categories: new Set(initial.categories || []),
        dateFrom: initial.dateFrom || '',
        dateTo: initial.dateTo || '',
        status: initial.status || null,
        range: (initial.dateFrom || initial.dateTo) ? { from: initial.dateFrom ? parseLocalDate(initial.dateFrom) : undefined, to: initial.dateTo ? parseLocalDate(initial.dateTo) : undefined } : undefined,
    })

    const searchParams = useSearchParams()
    const lang = searchParams?.get?.('lang') || 'en'

    // derive categories from the shared activities export; prefer the requested language
    const categoriesList = React.useMemo(() => {
        try {
            const entry = (activitiesExport || []).find(e => e[lang]) || activitiesExport[0] || {}
            const arr = entry[lang] || entry.en || []
            return arr.map(a => ({ value: a.value, label: a.label, icon: a.icon }))
        } catch (err) {
            return []
        }
    }, [lang])

    useEffect(() => {
        setLocal({
            categories: new Set(initial.categories || []),
            dateFrom: initial.dateFrom || '',
            dateTo: initial.dateTo || '',
            range: (initial.dateFrom || initial.dateTo) ? { from: initial.dateFrom ? parseLocalDate(initial.dateFrom) : undefined, to: initial.dateTo ? parseLocalDate(initial.dateTo) : undefined } : undefined,
            status: initial.status || null,
        })
    }, [initial, open])

    const toggleCategory = (c) => {
        const s = new Set(local.categories)
        if (s.has(c)) s.delete(c)
        else s.add(c)
        setLocal({ ...local, categories: s })
    }

    const clearAll = () => setLocal({ categories: new Set(), dateFrom: '', dateTo: '', status: null, range: undefined })
    
    // when sheet is closed, clear filters (reset UI). Don't force a default here;
    useEffect(() => {
        if (open === false) {
            // reset to empty state
            setLocal({ categories: new Set(), dateFrom: '', dateTo: '', status: null, range: undefined })
        }
    }, [open])

    const apply = () => {
        const out = {
            categories: Array.from(local.categories),
            dateFrom: local.dateFrom || null,
            dateTo: local.dateTo || null,
            status: local.status || null,
        }
        onApply && onApply(out)
        onOpenChange && onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[420px] overflow-scroll">
                <SheetHeader>
                    <SheetTitle>تصفية النتائج</SheetTitle>
                    <SheetDescription>اختر فلاتر الفئة والتاريخ والحالة ثم اضغط تطبيق.</SheetDescription>
                </SheetHeader>

                <div className="mt-4 space-y-6 overflow-auto">
                    {/* Category section */}
                    {showCategories && (
                        <section>
                            <h3 className="font-medium mb-2">الفئة</h3>
                            <div className="flex flex-col gap-2 max-h-48 overflow-auto pr-2">
                                {categoriesList && categoriesList.length > 0 ? (
                                    categoriesList.map((c) => {
                                        const Icon = c.icon || null
                                        return (
                                            <label key={c.value} className="flex items-center gap-2">
                                                <Checkbox checked={local.categories.has(c.value)} onCheckedChange={() => toggleCategory(c.value)} />
                                                {Icon ? <Icon className="w-4 h-4 text-muted-foreground" /> : null}
                                                <span className="text-sm">{c.label}</span>
                                            </label>
                                        )
                                    })
                                ) : (
                                    <div className="text-sm text-muted-foreground">لا توجد فئات</div>
                                )}
                            </div>
                        </section>
                    )}
{showDate && (
                        <section>
                            <h3 className="font-medium mb-2">التاريخ</h3>
                            <div className="flex gap-2">
                                <Calendar04
                                    mode="range"
                                    selected={local.range}
                                    onSelect={(range) => {
                                        setLocal({ ...local, range, dateFrom: range?.from ? formatLocalDate(range.from) : '', dateTo: range?.to ? formatLocalDate(range.to) : '' })
                                    }}
                                    className="rounded-lg border shadow-sm"
                                />
                            </div>
                        </section>
                    )}

                    {showStatus && (
                        <section>
                            <div className="flex items-center justify-between">
                                <h3 className="font-medium mb-2">الحالة</h3>
                                <button type="button" className="text-sm text-slate-500" onClick={() => setLocal({ ...local, status: null })}>مسح</button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {['قيد الإنتظار', 'مقبول', 'مرفوض'].map((s) => (
                                    <label key={s} className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="ufs-status"
                                            checked={local.status === s}
                                            onChange={() => setLocal({ ...local, status: s })}
                                            className="h-4 w-4"
                                        />
                                        <span className="text-sm">{s}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <SheetFooter className="mt-6">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={clearAll}>مسح الكل</Button>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange && onOpenChange(false)}>إلغاء</Button>
                            <Button onClick={apply}>تطبيق</Button>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
