"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MdClose, MdDone } from "react-icons/md";
import { Badge } from '@/components/ui/badge';
import DocsGallery from '@/components/ui/common/docsGallery/docs-gallery';

export default function SuppliersContent({ row }) {
    const [showReject, setShowReject] = useState(false);
    const [selected, setSelected] = useState(new Set());
    const panelRef = useRef(null);

    const statusText = String(row.status ?? '').trim();
    const isPending = /قيد|pending/i.test(statusText);
    const isRejected = /رفض|مرفوض|rejected/i.test(statusText);

    useEffect(() => {
        // If the row is no longer pending, ensure rejection UI is closed
        if (!isPending) {
            setShowReject(false);
            setSelected(new Set());
        }
    }, [isPending]);

    // Normalize category to array so render logic works whether the
    // caller provides a single string or an array of strings.
    const categories = Array.isArray(row.category) ? row.category : (row.category ? [row.category] : []);
    // Normalize branches into a display string so arrays render with commas
    const branchesDisplay = Array.isArray(row.branches) ? row.branches.join(', ') : (row.branches ?? '—');

    const reasons = [
        { id: 'missing_docs', label: 'المستندات المطلوبة غير صالحة' },
        { id: 'expired_docs', label: 'انتهاء صلاحية المستندات' },
        { id: 'mismatch', label: 'عدم تطابق المعلومات المدخلة' },
        { id: 'incomplete', label: 'البيانات غير مكتملة' },
        { id: 'does_not_match_the_requirements', label: 'لا يستوفي الشروط المطلوبة' },
        { id: 'repeated_request', label: 'طلب مكرر' },
    ];

    function toggleReason(id) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function sendRejection() {
        // placeholder: wire to API
        console.log('send rejection for', row.id, Array.from(selected));
        // After sending, hide rejection panel
        setShowReject(false);
        setSelected(new Set());
    }

    useEffect(() => {
        if (showReject && panelRef.current) {
            try {
                panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                // ignore
            }
        }
    }, [showReject]);

    // governorate & city lookups (keep in sync with supplierDialog mappings)
    const governorates = [
        { label: "القاهرة", value: "cairo" },
        { label: "الجيزة", value: "giza" },
        { label: "الإسكندرية", value: "alex" },
    ];

    const citiesMap = {
        cairo: [
            { label: "مدينة نصر", value: "nasr" },
            { label: "المعادي", value: "maadi" },
        ],
        giza: [
            { label: "الهرم", value: "haram" },
            { label: "الجيزة", value: "giza-city" },
        ],
        alex: [
            { label: "سيدي جابر", value: "sidi" },
            { label: "ستانلي", value: "stanley" },
        ],
    };

    function getGovernorateLabel(val) {
        if (!val) return null;
        const direct = governorates.find(g => String(g.value) === String(val));
        if (direct) return direct.label;
        const byLabel = governorates.find(g => String(g.label) === String(val));
        if (byLabel) return byLabel.label;
        return null;
    }

    function getCityLabel(govVal, cityVal) {
        if (!cityVal) return null;
        // try by governorate first
        const list = (govVal && citiesMap[govVal]) ? citiesMap[govVal] : Object.values(citiesMap).flat();
        const direct = list.find(c => String(c.value) === String(cityVal));
        if (direct) return direct.label;
        const byLabel = list.find(c => String(c.label) === String(cityVal));
        if (byLabel) return byLabel.label;
        return null;
    }

    return (
        <div className="w-full text-sm py-5">
            <div className="grid grid-cols-1  gap-6">
                <div>
                    <h4 className="font-semibold mb-3 border-b pb-1">المعلومات الأساسية</h4>
                    <div className="space-y-2 pr-4 flex items-center gap-4 justify-between">
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/4'><span>اسم المستخدم</span> <span>{row.fullName}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/4'><span>رقم الهاتف</span> <span>{row.phone ?? '+201298754321'}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/4'><span>الفرع الرئيسي</span> <span>{row.branch ?? '-'}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/4'>
                            <span>النشاط</span>
                            <span>
                                {categories.length > 0 ? (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {categories.map((c, i) => (
                                            <Badge key={i} variant={'outline'} className="px-3 py-1 text-xs" >{c}</Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge>
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 border-b pb-1">تفاصيل الموقع</h4>
                    <div className="space-y-2 pr-4 flex items-center gap-4 justify-between">
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/5'><span className='font-bold'>المحافظة</span> <span>{getGovernorateLabel(row.governorate) ?? (row.governorate ?? 'القاهرة')}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/5'><span className='font-bold'>المدينة</span> <span>{getCityLabel(row.governorate, row.city) ?? (row.city ?? 'المعادى')}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/5'><span className='font-bold'>العنوان</span> <span>{row.address ?? '—'}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/5'><span className='font-bold'>الفروع</span> <span>{branchesDisplay}</span></div>
                        <div className='border-r pr-3 flex flex-col gap-2 w-1/5'><span className='font-bold'>الرقم البريدى</span> <span>{row.postalCode ?? '—'}</span></div>
                    </div>
                </div>

                <div>
                    <h4 className="font-semibold mb-3 border-b pb-1">المستندات التجارية والقانونية</h4>
                    <div className="space-y-2 border-r pr-4">
                        {((row.docs ?? row.documents) || []).length > 0 ? (
                            <DocsGallery items={row.docs ?? row.documents ?? []} thumbWidth={160} thumbHeight={160} />
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center">📄</div>
                                <div className="truncate">{(row.documents && row.documents.length) ? row.documents.join(', ') : 'لا توجد مستندات'}</div>
                            </div>
                        )}
                    </div>
                </div>
                {/* If the row was rejected, show the reasons (read-only, pre-selected) */}
                {isRejected && (
                    <div>
                        <h4 className="font-semibold mb-3 border-b pb-1">أسباب الرفض</h4>
                        <div className="flex flex-wrap gap-3 pr-4">
                            {reasons.map(r => (
                                <label key={r.id} className="flex items-center gap-2">
                                    <Checkbox checked={Array.isArray(row.rejectionReasons) && row.rejectionReasons.includes(r.id)} disabled />
                                    <span className="text-sm">{r.label}</span>
                                </label>
                            ))}
                            {(!row.rejectionReasons || row.rejectionReasons.length === 0) && (
                                <div className="text-xs text-muted-foreground">لم يتم تحديد أسباب الرفض</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* main actions: only show when row is pending and hide when rejection panel is open */}
            {!showReject && isPending && (
                <div className="col-span-3 mt-4 flex items-center justify-end gap-4">
                    <Button size="sm" variant="outline" className="rounded-md px-8 hover:text-white hover:bg-green-500 border-green-500 text-green-500" onClick={() => console.log('accept', row.id)}>قبول <MdDone /></Button>
                    <Button size="sm" variant="outline" className="rounded-md px-8 hover:text-white hover:bg-red-500 border-red-500 text-red-500" onClick={() => setShowReject(true)}>رفض <MdClose /></Button>
                </div>
            )}

            {/* Rejection panel shown under the main content when triggered */}
            {showReject && isPending && (
                <div ref={panelRef} className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 gap-4" style={{ animation: 'slideFadeIn 260ms ease' }}>
                        <style>{`@keyframes slideFadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
                        <h4 className="font-semibold">ما الأسباب التي أدت إلى الرفض؟</h4>
                        <div className="flex flex-wrap gap-3">
                            {reasons.map(r => (
                                <label key={r.id} className="flex items-center gap-2">
                                    <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleReason(r.id)} />
                                    <span className="text-sm">{r.label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 mt-4">
                            <Button size="sm" variant="outline" onClick={() => { setShowReject(false); setSelected(new Set()); }}>العودة</Button>
                            <Button size="sm" variant="default" className="bg-amber-500 text-white"
                                onClick={() => {
                                    sendRejection();
                                    console.log('Rejection reasons', Array.from(selected));
                                }}
                                disabled={selected.size === 0}>إرسال أسباب الرفض</Button>
                        </div>
                        {selected.size === 0 && (
                            <div className="text-xs text-muted-foreground">اختر سببًا واحدًا على الأقل قبل الإرسال</div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
}
