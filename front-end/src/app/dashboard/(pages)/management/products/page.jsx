"use client";
import React, { useState, useEffect, Suspense } from 'react'
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useModal } from '@/hooks/useModal';
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DashCardGroup from '@/components/ui/common/dashCard/dashCardGroup';
import ProductsContent from '@/components/ui/common/dataTable/contents/products-content';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import { LuAward, LuPackageCheck, LuPackageX } from 'react-icons/lu';
import { TbPackages } from 'react-icons/tb';
import { useQueryFetch } from '@/hooks/useQueryFetch';
import { useSearchPagination } from '@/hooks/useSearchPagination';
import { useDispatch } from 'react-redux';
import { syncProductData, deleteProduct } from '@/redux/slices/productsManagementSlice';
import UnifiedFilterSheet from '@/components/ui/filters/UnifiedFilterSheet';
import Spinner from '@/components/ui/common/spinner/spinner';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود المنتج', width: 120, render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
    { key: 'productName', title: 'اسم المنتج', width: 200 },
    {
        key: 'avatar', title: 'العلامة التجارية', width: 150, render: (r) => (
            <div className="flex items-center gap-2">
                <Avatar><img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" /></Avatar>
                <div className=" truncate font-honor">{r.name}</div>
            </div>
        )
    },
    {
        key: 'category', title: 'تصنيف المنتج', width: 140, render: (r) => {
            const cats = Array.isArray(r.category) ? r.category : (r.category ? [r.category] : []);
            if (cats.length === 0) return <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge>;
            if (cats.length === 1) return <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]}</Badge>;

            // show first category and a small +N indicator for the rest
            return (
                <div className="flex items-center gap-2">
                    <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]} + {cats.length - 1}</Badge>
                </div>
            );
        }
    },
    {
        key: 'subCategory', title: 'تصنيف فرعي', width: 140, render: (r) => {
            const cats = Array.isArray(r.subCategory) ? r.subCategory : (r.subCategory ? [r.subCategory] : []);
            if (cats.length === 0) return <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge>;
            if (cats.length === 1) return <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]}</Badge>;

            // show first subCategory and a small +N indicator for the rest
            return (
                <div className="flex items-center gap-2">
                    <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]} + {cats.length - 1}</Badge>
                </div>
            );
        }
    },
    {
        key: 'status', title: 'الحالة', width: 120, render: (r) => {
            const raw = String(r.status ?? '').trim();
            const lower = raw.toLowerCase();

            // Map common Arabic/English variants to states
            const isRejected = /غير مفعل|مرفوض|rejected/.test(lower);
            const isApproved = /مفعل|موافق|approved|active/.test(lower);

            const base = 'px-3 py-5! text-xs rounded-xl';
            let classes = '';

            if (isRejected) {
                classes = `${base} bg-red-50 text-red-600`;
            } else if (isApproved) {
                classes = `${base} bg-green-50 text-green-500`;
            } else {
                // default / unknown -> pending-style fallback
                classes = `${base} bg-[#FDEDCE] text-go-primary-o`;
            }

            return <span className={classes}>{raw}</span>;
        }
    },
    // { key: 'branch', title: 'الفرع الرئيسى', width: 90, render: (r) => <div>{r.branch}</div> },
    // { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
    // { key: 'accessed-from', title: 'وسيلة الوصول', width: 120, render: (r) => <div>{r.accessedFrom}</div> },
    // { key: 'date', title: 'تاريخ الإنضمام', width: 140 },
    { key: 'actions', title: 'خيارات', width: 120 },
];


// const rows = [
//     {
//         id: '1', type: 'product', productName: 'شاي أحمد تي - Ahmed Tea ',description:"شاي أحمد تي مزيج فاخر من أوراق الشاي المختارة، بنكهة قوية ورائحة منعشة تمنحك لحظة دفء واستمتاع في كل كوب.", avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات', image:'https://ahmadteausa.com/cdn/shop/products/Special_Blend_1g_Right_1.png?v=1645207369', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'i3', type: 'image', src: 'https://picsum.photos/800/600?3', title: 'صورة 3' },
//             { id: 'i4', type: 'image', src: 'https://picsum.photos/800/600?4', title: 'صورة 4' },
//         ]
//     },
//     {
//         id: '2', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'غير مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '3', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '4', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'غير مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '5', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '6', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//         ]
//     },
// ];
// const statsConfig = [
//     {
//         id: "total_products",
//         title: "إجمالي المنتجات",
//         value: 100,
//         unit: "منتج",
//         note: "+52 منتج جديد هذا الشهر",
//         icon: TbPackages,
//         iconBg: "bg-go-bg-l-e",
//         iconColor: "text-go-primary-g"
//     },
//     {
//         id: "avalible_products",
//         title: "الموردون المعتمدون",
//         value: 40,
//         unit: "منتج",
//         note: "78% من إجمالي المنتجات",
//         icon: LuPackageCheck,
//         iconBg: "bg-green-100",
//         iconColor: "text-green-600"
//     },
//     {
//         id: "halted_products",
//         title: "المنتجات الموقوفة",
//         value: 8,
//         unit: "منتج",
//         note: "في انتظار إعادة التوريد",
//         icon: LuPackageX,
//         iconBg: "bg-red-100",
//         iconColor: "text-go-primary-cancel"
//     },
//     {
//         id: "unused_products",
//         title: "منتجات غير مستخدمة",
//         value: 30,
//         unit: "منتج",
//         note: "عدد المنتجات التي لم يتم طلبها من أي مورد حتى الآن",
//         icon: LuAward,
//         iconBg: "bg-yellow-100",
//         iconColor: "text-yellow-600"
//     },
// ];


const ProductsManagementContent = () => {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { openModal } = useModal();

    // Pagination state moved up to control fetch
    const {
        page: currentPage,
        limit,
        setSearch,
        setPage,
        setLimit,
        setPagination,
        searchQuery,
    } = useSearchPagination({
        queryKey: 'products-search',
        isOnline: true,
        initialLimit: 5,
        data: [], // Not used for online state
        fuseOptions: { keys: ["code", "productName", "name"], threshold: 0.35 }
    });

    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({});

    // Prepare API params from filters
    const apiFilterParams = {};
    if (filters.status) {
        // Map UI status 'مفعل'/'غير مفعل' to API expected boolean or string
        if (filters.status === 'مفعل') apiFilterParams.isActive = true;
        else if (filters.status === 'غير مفعل') apiFilterParams.isActive = false;
        else apiFilterParams.status = filters.status;
    }
    if (filters.categories && filters.categories.length > 0) {
        apiFilterParams.categories = filters.categories;
    }

    const { data, isLoading, isError } = useQueryFetch(
        ['products', currentPage, limit, apiFilterParams, searchQuery],
        '/api/catalog/search',
        {
            params: {
                pageSize: limit,
                page: currentPage,
                search: searchQuery,
                ...apiFilterParams
            }
        }
    );
    // Watch for URL changes manually
    const globalParams = useSearchParams();
    const [forceVal, setForceVal] = useState(0);
    
    useEffect(() => {
        // If the URL parameters change, force a re-render to ensure useQueryFetch picks it up
        // This acts as a backup if the router context isn't automatically prompting a re-render
        if (globalParams.get('page')) {
            console.log('Page param detected change:', globalParams.get('page'));
            setForceVal(v => v + 1);
        }
    }, [globalParams]);
    const router = useRouter();
    const products = data?.data?.items || [];
    const statusBar = data?.data?.statusBar || [];
    const rawData = data?.data || {};

    const statusBarSummary = statusBar.reduce((acc, it) => {
        acc[it.id] = { value: it.value, note: it.note };
        return acc;
    }, {});

    // Helper to robustly integer-ize values
    const toInt = (v) => {
        const parsed = parseInt(v, 10);
        return isNaN(parsed) ? null : parsed;
    };

    // Resolve total count: 
    // 1. Explicit API total field
    // 2. Fallback to total_products from status bar (usually total DB count, but better than 0)
    // 3. Fallback to current items length (prevents 0 if we have items)
    let totalCount = toInt(rawData.totalCount) ?? 
                     toInt(rawData.total) ?? 
                     toInt(rawData.count) ?? 
                     toInt(rawData.totalItems) ??
                     toInt(statusBarSummary['total_products']?.value);
                     
    // If we have items but no total, at least use the current length to show something
    if (totalCount === null || (products.length > 0 && totalCount === 0)) {
        totalCount = products.length;
    }
    
    // Safety fallback
    if (totalCount === null) totalCount = 0;

    // Use a stable, forced totalCount for DataTable. 
    // If the server says "Total: 100", but we are on Page 1 with Limit 10, DataTable needs "Total: 100".
    // If we are relying on partial data, we might need to "fake" it to allow the next button.
    const effectiveTotalCount = (products.length === limit) ? (totalCount > (currentPage * limit) ? totalCount : ((currentPage + 1) * limit)) : totalCount;

    // Sync with Redux (using centralized logic)
    useEffect(() => {
        if (products.length > 0) {
            dispatch(syncProductData(products));
        }
    }, [products, dispatch]);
    
    // Debug: Check if pagination updates
    useEffect(() => {
        console.log('Products Page Debug:', { currentPage, limit, searchQuery, effectiveTotalCount, totalCountRaw: totalCount, productsLength: products.length });
    }, [currentPage, limit, searchQuery, effectiveTotalCount, totalCount, products.length]);

    // Map products to table rows
    const allRows = products.map(p => {
        const mainVariant = p.productVariants?.find(v => v.isMainImg) || p.productVariants?.[0] || {};
        const brand = p.brands?.[0] || {};
        
        // Helper to validate/clean image URLs to prevent 404s on product names
        const getValidUrl = (url) => {
            if (!url || typeof url !== 'string') return null;
            if (url.startsWith('http') || url.startsWith('/')) return url;
            // Discard values that look like product names or garbage
            return null;
        };

        const avatarUrl = getValidUrl(brand.imgUrl) || getValidUrl(p.imageUrl);

        return {
            id: p.id,
            type: 'product',
            productName: p.name,
            description: mainVariant.description || p.name,
            avatar: brand.imgUrl || p.imageUrl || avatarUrl, // Fallback to product image if brand image missing
            name: brand.name || 'Unknown Brand',
            code: p.id, // Full ID
            category: p.categories?.map(c => c.name) || [],
            subCategory: p.subCategories?.map(s => s.name) || [],
            status: p.isActive ? 'مفعل' : 'غير مفعل', // Dummy status logic based on isTax
            image: mainVariant.imageUrl || p.imageUrl,
            isTax: p.isTax,
            // Add other fields as needed by the table
            // Add other fields as needed by the details component
            _raw: p
        };
    });

    const rows = allRows; // Client-side filtering removed: Server handles filtering now.

    const statsConfig = [
        {
            id: "total_products",
            title: "إجمالي المنتجات",
            value: statusBarSummary['total_products']?.value || 0,
            unit: "منتج",
            note: `${statusBarSummary['total_products']?.note}+ منتج جديد هذا الشهر`,
            icon: TbPackages,
            iconBg: "bg-go-bg-l-e",
            iconColor: "text-go-primary-g"
        },
        {
            id: "avalible_products",
            title: "المنتجات المتاحة",
            value: statusBarSummary['avalible_products']?.value || 0,
            unit: "منتج",
            note: `${statusBarSummary['avalible_products']?.note}% من إجمالي المنتجات`,
            icon: LuPackageCheck,
            iconBg: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            id: "halted_products",
            title: "المنتجات الموقوفة",
            value: statusBarSummary['halted_products']?.value || 0,
            unit: "منتج",
            note: statusBarSummary['halted_products']?.note || "في انتظار إعادة التوريد",
            icon: LuPackageX,
            iconBg: "bg-red-100",
            iconColor: "text-go-primary-cancel"
        },
        {
            id: "unused_products",
            title: "منتجات غير مستخدمة",
            value: statusBarSummary['unused_products']?.value || 0,
            unit: "منتج",
            note: statusBarSummary['unused_products']?.note || "عدد المنتجات التي لم يتم طلبها من أي مورد حتى الآن",
            icon: LuAward,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600"
        },
    ];

    return <>

        {/* <ContentSkeleton /> */}
        <div className="flex gap-4 items-center flex-col">
            <div className="w-full">
                <DashCardGroup statsConfig={statsConfig} />
            </div>
            <DashboardContentHeader
                title={
                    <div className="flex items-center gap-2">
                        <span>إدارة المنتجات</span>
                        {isLoading && <Spinner />}
                    </div>
                }
                createButtonTitle="إضافة منتج جديد"
                apiCreate={() => router.push('/dashboard/management/products/add-products')}
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibleColumnsChange={setVisibleColumns}
                apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
                // apiFilter2={{ title: "تصفية", onClick: () => setIsFilterOpen(true) }}
                searchPlaceholder="ابحث في المنتجات..."
                onSearch={setSearch}
            />


            <DataTable
                isLoading={isLoading}
                columns={columns}
                visibleColumns={visibleColumns}
                data={rows}
                onDelete={async (id) => {
                    try {
                        await dispatch(deleteProduct(id)).unwrap();
                        toast.success("تم حذف المنتج بنجاح");
                        queryClient.invalidateQueries(['products']);
                    } catch (error) {
                        toast.error(error || "حدث خطأ أثناء حذف المنتج");
                    }
                }}
                onEdit={(r) => router.push(`/dashboard/management/products/update-product?id=${r.id}`)}
                detailsComponentMap={{ product: ProductsContent }}

                pageSizeOptions={[5, 10, 25]}
                manualPagination={true}
                page={currentPage - 1} 
                initialPageSize={limit}
                totalRows={effectiveTotalCount}
                onPageChange={(p, s) => { 
                    console.log('UI: onPageChange triggered', { newPageIndex: p, pageSize: s, currentPage, effectiveTotalCount });
                    // p is 0-based index from DataTable
                    // setPage expects 1-based page number
                    const newPage = p + 1;

                    if (s !== limit) {
                        // Page size changed, DataTable resets to page 0 (newPage=1).
                        // Use setPagination to update both atomically to avoid race conditions.
                        setPagination({ page: newPage, limit: s });
                    } else if (newPage !== currentPage) {
                        setPage(newPage);
                    }
                }}
                onSelectionChange={(sel) => console.log('selected', sel)}
                onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
            />

            <UnifiedFilterSheet
                open={isFilterOpen}
                onOpenChange={setIsFilterOpen}
                initial={filters}
                onApply={(val) => {
                    setFilters(val);
                    setPage(1); // Reset to first page when filtering
                }}
                showCategories={true}
                showDate={false}
                showStatus={true}
                statusOptions={['مفعل', 'غير مفعل']}
            />
        </div>
        {/* Debug Data */}
        <div className="w-full p-4 bg-gray-100 rounded overflow-auto max-h-60 text-xs" dir="ltr">
            <pre>{JSON.stringify(products, null, 2)}</pre>
        </div>

    </>

}

const ProductsManagementPage = () => {
    return (
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center p-10"><Spinner /></div>}>
            <ProductsManagementContent />
        </Suspense>
    );
};

export default ProductsManagementPage

