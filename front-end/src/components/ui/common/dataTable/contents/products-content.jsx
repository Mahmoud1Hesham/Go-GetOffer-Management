"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
// Checkbox not used in this file
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { MdDelete } from 'react-icons/md';
import { ChevronDown } from 'lucide-react';
import DocsGallery from '@/components/ui/common/docsGallery/docs-gallery';
import DataTable from '@/components/ui/common/dataTable/dataTable';

// Product details accordion content
// Sections:
//  - Basic Info (name, sku, brand, category)
//  - Product Details (image, description)
//  - Weight / Price table (weight with secondary text underneath, price, status toggle, actions)
// columns are defined per-table inside the component so they can
// reference local functions/state. Dummy data will be provided below.

export default function ProductsContent({ row }) {
    const panelRef = useRef(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    useEffect(() => {
        if (panelRef.current) {
            try { panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
        }
    }, []);

    const categories = Array.isArray(row.category) ? row.category : (row.category ? [row.category] : []);

    // Dummy data rows for product variants (weights/prices)
    const dummyVariants = [
        { id: 'v1', image: row.avatar ?? row.image, weightMain: '150 جم', weightSub: '100 فتلة', price: '100', active: true, qty: 100 },
        { id: 'v2', image: row.avatar ?? row.image, weightMain: '250 جم', weightSub: '100 فتلة', price: '180', active: true, qty: 50 },
        { id: 'v3', image: row.avatar ?? row.image, weightMain: '500 جم', weightSub: '200 فتلة', price: '300', active: false, qty: 20 },
    ];

    const [weights, setWeights] = useState(dummyVariants);

    function toggleActive(idx) {
        setWeights(prev => {
            const next = prev.map((p, i) => i === idx ? { ...p, active: !p.active } : p);
            console.log('toggle weight active', row.id, idx, next[idx].active);
            return next;
        });
    }

    function doAction(action, idx) {
        console.log('action', action, 'on', row.id, idx);
        if (action === 'delete') {
            setWeights(prev => prev.filter((_, i) => i !== idx));
            setShowRemoveConfirm(false);
        }
    }

    // Define table columns here so they can use local `weights`, `toggleActive`, and `doAction`.
    const tableColumns = [
        { key: 'img', title: 'الصورة', width: 100, render: (p) => <img src={p.image ?? row.image ?? row.avatar} alt="thumb" className="w-12 h-12 object-cover rounded" /> },
        {
            key: 'weight', title: 'الوزن', width: 180, render: (p) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{p.weightMain}</span>
                    <span className="text-xs text-muted-foreground">{p.weightSub}</span>
                </div>
            )
        },
        { key: 'qty', title: 'عدد موردين المنتج', width: 120, render: (p) => (<div>{p.qty ?? p.count ?? 100}</div>) },
        // actions: show current status as the dropdown trigger label (colored) + chevron
        {
            key: 'actions', title: 'الحالة', width: 160, render: (p) => {
                const isActive = Boolean(p.active);
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" className="inline-flex items-center gap-2">
                                {isActive ? (
                                    <span className="inline-block px-2 py-1 text-xs rounded bg-green-50 text-green-600">مفعل</span>
                                ) : (
                                    <span className="inline-block px-2 py-1 text-xs rounded bg-red-50 text-red-600">معطل</span>
                                )}
                                <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            {!isActive ? (
                                <DropdownMenuItem onSelect={() => { const idx = weights.findIndex(x => x.id === p.id); setWeights(prev => prev.map((it, i) => i === idx ? { ...it, active: true } : it)); }}>تفعيل</DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onSelect={() => { const idx = weights.findIndex(x => x.id === p.id); setWeights(prev => prev.map((it, i) => i === idx ? { ...it, active: false } : it)); }}>تعطيل</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        },
        // delete column: separate destructive button
        {
            key: 'delete', title: 'حذف', width: 100, render: (p) => (
                <Button size="sm" variant="destructive" onClick={() => doAction('delete', weights.findIndex(x => x.id === p.id))}><MdDelete /></Button>
            )
        }
    ];

    return (
        <div ref={panelRef} className="w-full text-sm py-5">
            <div className="grid grid-cols-1 gap-6">
                {/* Basic info */}
                <div>
                    <h4 className="text-xl font-semibold mb-3 border-b pb-1">المعلومات الأساسية</h4>
                    <div className="flex flex-col gap-4 justify-between pr-4">
                        <div className="flex items-center gap-4">
                            <div className="">
                                <img src={row.image ?? row.avatar} alt={row.name} className="w-52 h-52 rounded object-cover" />
                            </div>
                            <div className='flex flex-col justify-center gap-3'>
                                <div className='flex flex-col gap-3'>
                                    <div className="text-muted-foreground font-figtree">id : {row.sku ?? row.code ?? '—'}</div>
                                    <div className="text-xl font-semibold">{row.productName}</div>
                                </div>
                                <div className='flex flex-col gap-3'>
                                    <div className="text-muted-foreground font-figtree">وصف المنتج</div>
                                    <div className="font-semibold w-4/5">{row.description ?? '—'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Product details */}
                        <div>
                            <h4 className="text-xl font-semibold mb-3 border-b pb-1">تفاصيل المنتج</h4>
                            <div className='flex gap-6 mb-10 mt-5'>
                                <div className='flex flex-col border-r px-4 gap-2'><span className=' text-muted-foreground'>العلامة التجارية</span><span className='text-lg'>{row.name ?? '—'}</span></div>
                                <div className='flex flex-col border-r px-4 gap-2'><span className=' text-muted-foreground'>التصنيف</span>
                                    <div className="flex items-center gap-2">
                                        {categories.length === 0 ? <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge> : categories.map((c, i) => (<Badge key={i} variant={'outline'} className="px-3 py-1 text-xs">{c}</Badge>))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 pr-4">
                        <div>
                            {((row.docs ?? row.documents) || []).length > 0 ? (
                                <DocsGallery items={row.docs ?? row.documents ?? []} thumbWidth={160} thumbHeight={160} />
                            ) : (
                                <div className="text-xs text-muted-foreground">لا توجد صور/مستندات</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weights / Prices table */}
                <div>
                    <h4 className="text-xl font-semibold mb-10 border-b pb-1">خيارات الوزن والسعر</h4>
                    <div>
                        <DataTable
                            columns={tableColumns}
                            data={weights}
                            disableAccordion={true}
                            showDragHandle={true}
                            showPagination={false}
                            showCheckbox={false}
                            onDelete={(id) => { console.log('delete via table', id); }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
