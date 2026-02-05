"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import { useModal } from '@/hooks/useModal';
import { useQueryFetch, useMutationFetch } from '@/hooks/useQueryFetch';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { registerCallback } from '@/lib/modalCallbacks';

// Product details accordion content
// Sections:
//  - Basic Info (name, sku, brand, category)
//  - Product Details (image, description)
//  - Weight / Price table (weight with secondary text underneath, price, status toggle, actions)
// columns are defined per-table inside the component so they can
// reference local functions/state. Dummy data will be provided below.

export default function ProductsContent({ row }) {
    const queryClient = useQueryClient();
    const { openModal } = useModal();
    const panelRef = useRef(null);
    const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

    useEffect(() => {
        if (panelRef.current) {
            try { panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) { }
        }
    }, []);

    const categories = Array.isArray(row.category) ? row.category : (row.category ? [row.category] : []);
    const subCategories = Array.isArray(row.subCategory) ? row.subCategory : (row.subCategory ? [row.subCategory] : []);

    // Fetch details if variants are missing
    const hasVariants = row.productVariants?.length > 0 || row._raw?.productVariants?.length > 0;
    const { data: productDetails } = useQueryFetch(
        ['product-details', row.id],
        `/api/Product/id`,
        { params: { Id: row.id }, enabled: !hasVariants }
    );

    const fetchedVariants = productDetails?.data?.productVariants || [];

    // Map real variants if available, otherwise use dummy data
    const variantsList = hasVariants
        ? (row.productVariants || row._raw?.productVariants)
        : fetchedVariants;

    const mappedVariants = React.useMemo(() => variantsList.map((v, idx) => {
        // Try to find translation
        const translation = v.productVariantTranslations?.find(t => t.languageCode === 'ar-EG')
            || v.productVariantTranslations?.[0]
            || {};

        return {
            id: v.id || `v-${idx}`,
            image: v.imgUrl || v.imageUrl || row.image, // Use variant image
            weightMain: v.weightDisplay || translation.weightDisplay,
            weightSub: v.description || translation.description || '',
            price: v.price || '0',
            active: v.isActive ?? true,
            qty: v.quantity || 0
        };
    }), [variantsList, row.image]);

    const [weights, setWeights] = useState(mappedVariants.length > 0 ? mappedVariants : []);

    useEffect(() => {
        if (mappedVariants.length > 0) {
            setWeights(mappedVariants);
        }
    }, [mappedVariants]);

    const { mutate: setVariantActive } = useMutationFetch({
        url: '/api/product/SetProductVariantActive',
        options: { method: 'PUT' }, // Ensure this matches API requirement (PUT/POST)
        mutationOptions: {
            onSuccess: (data, variables) => {
                toast.success(variables.IsActive ? "تم تفعيل الصنف" : "تم تعطيل الصنف");
                
                // 1. Update local state for immediate feedback
                setWeights(prev => prev.map(w =>
                    w.id === variables.Id ? { ...w, active: variables.IsActive } : w
                ));

                // 2. Refetch queries to ensure data consistency
                // Refetch the specific product details if they are being viewed via query
                queryClient.invalidateQueries(['product-details', row.id]);
                // Refetch the main products list to update the parent row if needed
                queryClient.invalidateQueries(['products']);
                // Also try refetching the search/catalog query just in case
                queryClient.invalidateQueries(['product', row.id]);
            },
            onError: (err) => {
                toast.error(err?.response?.data?.message || "حدث خطأ في تغيير الحالة");
            }
        }
    });

    function doAction(action, idx) {
        console.log('action', action, 'on', row.id, idx);
        if (action === 'delete') {
            setWeights(prev => prev.filter((_, i) => i !== idx));
            setShowRemoveConfirm(false);
        }
    }

    function confirmStatusChange(id, isActive) {
        const key = registerCallback(() => setVariantActive({ Id: id, IsActive: isActive }));
        openModal({
            type: isActive ? 'success' : 'failure',
            title: isActive ? 'تفعيل الصنف' : 'تعطيل الصنف',
            message: `هل أنت متأكد من ${isActive ? 'تفعيل' : 'تعطيل'} هذا الصنف؟`,
            actionName: 'تأكيد',
            cancelTitle: 'إلغاء',
            customActionKey: key
        });
    }

    // Define table columns here so they can use local `weights`, `toggleActive`, and `doAction`.
    const tableColumns = [
        {
            key: 'img', title: 'الصورة', width: 100, render: (p) => (
                <img
                    src={p.image ?? row.image ?? row.avatar}
                    alt="thumb"
                    className="w-12 h-12 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => openModal({ type: 'image-preview', image: p.image ?? row.image ?? row.avatar, title: "صورة المنتج", message: row.productName, cancelTitle: 'إغلاق' })}
                />
            )
        },
        {
            key: 'weight', title: 'الوزن', width: 180, render: (p) => (
                <div className="flex flex-col">
                    <span className="font-semibold">{p.weightMain}</span>
                </div>
            )
        },
        {
            key: 'description', title: 'الوصف', width: 180, render: (p) => (
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{p.weightSub}</span>
                </div>
            )
        },
        // { key: 'qty', title: 'عدد موردين المنتج', width: 120, render: (p) => (<div>{p.qty ?? p.count ?? 100}</div>) },
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
                                <DropdownMenuItem onSelect={() => confirmStatusChange(p.id, true)}>تفعيل</DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onSelect={() => confirmStatusChange(p.id, false)}>تعطيل</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            }
        },
        // delete column: separate destructive button
        // {
        //     key: 'delete', title: 'حذف', width: 100, render: (p) => (
        //         <Button size="sm" variant="destructive" onClick={() => doAction('delete', weights.findIndex(x => x.id === p.id))}><MdDelete /></Button>
        //     )
        // }
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
                                <img
                                    src={row.image ?? row.avatar}
                                    alt={row.name}
                                    className="w-52 h-52 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => openModal({ type: 'image-preview', image: row.image ?? row.avatar, title: "صورة المنتج", message: row.productName, cancelTitle: 'إغلاق' })}
                                />
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
                                <div className='flex flex-col border-r px-4 gap-2'>
                                    <span className=' text-muted-foreground'>العلامة التجارية</span>
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={row.avatar}
                                            alt={row.name}
                                            className="w-8 h-8 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => openModal({ type: 'image-preview', image: row.avatar, title: "صورة العلامة التجارية", message: row.name, cancelTitle: 'إغلاق' })}
                                        />
                                        <span className='text-lg'>{row.name ?? '—'}</span>
                                    </div>
                                </div>
                                <div className='flex flex-col border-r px-4 gap-2'><span className=' text-muted-foreground'>التصنيف</span>
                                    <div className="flex items-center gap-2">
                                        {categories.length === 0 ? <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge> : categories.map((c, i) => (<Badge key={i} variant={'outline'} className="px-3 py-1 text-xs">{c}</Badge>))}
                                    </div>
                                </div>
                                <div className='flex flex-col border-r px-4 gap-2'><span className=' text-muted-foreground'>التصنيف الفرعي</span>
                                    <div className="flex items-center gap-2">
                                        {subCategories.length === 0 ? <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge> : subCategories.map((c, i) => (<Badge key={i} variant={'outline'} className="px-3 py-1 text-xs">{c}</Badge>))}
                                    </div>
                                </div>
                                <div className='flex flex-col border-r px-4 gap-2'><span className=' text-muted-foreground'>ضريبة القيمة المضافة</span>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={'outline'} className="px-3 py-1 text-xs">{row.isTax ? "نعم" : "لا"}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="space-y-2 pr-4">
                        <div>
                            {((row.docs ?? row.documents) || []).length > 0 ? (
                                <DocsGallery items={row.docs ?? row.documents ?? []} thumbWidth={160} thumbHeight={160} />
                            ) : (
                                <div className="text-xs text-muted-foreground">لا توجد صور/مستندات</div>
                            )}
                        </div>
                    </div> */}
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
