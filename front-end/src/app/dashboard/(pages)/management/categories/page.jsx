"use client";
import { useQueryFetch, useMutationFetch } from '@/hooks/useQueryFetch';
import useRefreshCooldown from '@/hooks/useRefreshCooldown';
import useSearchPagination from '@/hooks/useSearchPagination';
import { setCategories, selectCategories } from '@/redux/slices/categoriesSlice';
import { useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ContentSkeleton from '@/components/ui/common/content-skeleton/content-skeleton'
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import UnifiedFilterSheet from '@/components/ui/filters/UnifiedFilterSheet';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Spinner from '@/components/ui/common/spinner/spinner';
import CategoryDialog from '@/components/ui/common/dialogs/categoryDialog';
import { useQueryClient } from '@tanstack/react-query';

const columns = [
    // { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود التصنيف', width: 180, render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
    {
        key: 'image', title: 'صورة التصنيف', width: 150, render: (r) => (
            <div className="flex items-center justify-center gap-2">
                <Avatar><img src={r.image} alt={r.name} className="w-12 h-12 rounded-full object-cover" /></Avatar>
            </div>
        )
    },
    { key: 'name_AR', title: 'اسم التصنيف (عربي)', width: 150 },
    { key: 'name_EN', title: 'اسم التصنيف (إنجليزي)', width: 150 },
    { key: 'actions', title: 'خيارات', width: 120 },
];


// const rows = [
//     {
//         id: '1', type: 'supplier', name: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 83513, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'المعادى', assignedTo: 'سارة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '2', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', assignedTo: 'كريم', accessedFrom: 'مندوب', address: "السادس من أكتوبر", governorate: 'giza', city: 'haram', phone: '01010000002', fullName: 'أحمد علي', email: 'supplier2@example.com', activities: ['food products'], branches: ['السويس'], postalCode: '67890', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '3', type: 'supplier', name: 'أحمد علي عوضين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه', 'ادوات تنظيف'], status: 'مقبول', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'maadi', phone: '01010000003', fullName: 'أحمد علي عوضين', email: 'supplier3@example.com', activities: ['food products', 'office supplies', 'buffet', 'cleaning supplies'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '4', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'nasr', phone: '01010000004', fullName: 'أحمد علي', email: 'supplier4@example.com', activities: ['food products'], branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '33445', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '5', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', assignedTo: 'كريم', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'معادى', governorate: 'cairo', city: 'maadi', phone: '01010000005', fullName: 'أحمد علي', email: 'supplier5@example.com', activities: ['food products'], branches: ['المعادى', 'القاهرة الجديدة'], postalCode: '55667', rejectionReasons: ['missing_docs', 'expired_docs'], docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '6', type: 'supplier', name: 'أحمد علي حسنين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'مندوب', address: 'القاهرة الجديدة', governorate: 'cairo', city: 'nasr', phone: '01010000006', fullName: 'أحمد علي حسنين', email: 'supplier6@example.com', activities: ['food products'], branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '77889', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '7', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'الدقي', governorate: 'giza', city: 'giza-city', phone: '01010000007', fullName: 'أحمد علي', email: 'supplier7@example.com', activities: ['food products'], branches: ['الدقي', 'الجيزه'], postalCode: '99000', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '8', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'تعبئه وتغليف'], status: 'مرفوض', branch: 'جيزة', assignedTo: 'كريم', accessedFrom: 'مندوب', address: 'فيصل', governorate: 'alex', city: 'sidi', phone: '01010000008', fullName: 'أحمد علي', email: 'supplier8@example.com', activities: ['food products', 'packaging materials'], branches: ['فيصل', 'الجيزة'], postalCode: '10101', rejectionReasons: ['mismatch'], docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '9', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'بوفيه'], status: 'قيد الانتظار', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'nasr', phone: '01010000009', fullName: 'أحمد علي', email: 'supplier9@example.com', activities: ['food products', 'buffet'], branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '10', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه'], status: 'مرفوض', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'maadi', phone: '01010000010', fullName: 'أحمد علي', email: 'supplier10@example.com', activities: ['food products', 'office supplies', 'buffet'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['does_not_match_the_requirements', 'repeated_request'], docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '11', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'nasr', phone: '01010000011', fullName: 'أحمد علي', email: 'supplier11@example.com', activities: ['food products'], branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223', docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
//     {
//         id: '12', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'nasr', phone: '01010000012', fullName: 'أحمد علي', email: 'supplier12@example.com', activities: ['food products'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['incomplete'], docs: [
//             { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//             { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//             { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//             { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//         ]
//     },
// ];

const page = () => {
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'ar';


    // 1. Fetch Categories
    const { data: apiData, isLoading: isInitialFetching, isFetching: isApiFetching, refetch } = useQueryFetch(['allCategories'], '/api/category/withallname');
    const { onClick: handleCategoriesRefresh, title: refreshTitleCategories, disabled: refreshDisabledCategories } = useRefreshCooldown({ refetch, successMessage: 'تم تحديث التصنيفات' });

    useEffect(() => {
        setVisibleColumns(columns.map(c => c.key));
    }, []);

    // 2. Dispatch to Redux
    useEffect(() => {
        if (apiData?.data) {
            const categories = Array.isArray(apiData.data) 
                ? apiData.data 
                : (apiData.data.items || []);
            dispatch(setCategories(categories));
        }
    }, [apiData, dispatch]);

    const categories = useSelector(selectCategories);

    const mappedRows = (categories || []).map((c) => ({
        code: c.id,
        name_AR: c.name_AR || c.name,
        name_EN: c.name_EN || c.name,
        image: c.imgUrl,
        categorykey: c.categoryKey,
        ...c
    }));

    // 3. Search & Pagination
    const {
        data: pagedData,
        searchedData,
        total,
        page: pageIndex,
        limit,
        setSearch,
        setPage,
        setLimit,
        isLoading: isSearchLoading
    } = useSearchPagination({
        data: mappedRows,
        isOnline: false,
        fuseOptions: { keys: ["name_AR", "name_EN", "code"], threshold: 0.3 }
    });

    const isLoading = isInitialFetching || isSearchLoading;

    const deleteMutation = useMutationFetch({
        url: (id) => ({
            url: `/api/category`,
            method: 'DELETE',
            params: { Id: id }
        }),
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allCategories'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });

                toast.success( lang === 'en' ? "Category deleted successfully" : "تم حذف التصنيف بنجاح");
            },
            onError: (err) => {
                toast.error( lang === 'en' ? "Error deleting category" : "حدث خطأ أثناء حذف التصنيف");
            }
        }
    });

    return <>
        <DashboardContentHeader
            title={
                <div className="flex items-center gap-2">
                    <span>إدارة التصنيفات</span>
                    {isLoading && <Spinner />}
                </div>
            }

            createButtonTitle="إضافة تصنيف"
            createComponent={<CategoryDialog mode='create' />}
            columns={columns}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
            // apiFilter2={{ title: "تصفية", onClick: () => setFilterSheetOpen(true) }}
            apiRefresh={{ title: refreshTitleCategories, onClick: handleCategoriesRefresh, isLoading: isApiFetching, disabled: refreshDisabledCategories }}
            searchPlaceholder="ابحث في التصنيفات..."
            onSearch={(value) => setSearch(value)}
        />
        <DataTable
            columns={columns}
            data={searchedData}
            visibleColumns={visibleColumns}
            disableAccordion={true}
            isLoading={isLoading}

            // detailsComponentMap={{ supplier: SuppliersContent }}
            rowDialog={<CategoryDialog />}
            onDelete={(id) => {
                deleteMutation.mutate(id);
            }}

            pageSizeOptions={[5, 10, 25]}
        // initialPageSize={limit}
        // totalRows={searchedData?.length || 0}
        // onPageChange={(page, size) => { setPage(page); setLimit(size); }}
        // onSelectionChange={(sel) => console.log('selected', sel)}
        // onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
        />
        {/* <UnifiedFilterSheet
                    open={filterSheetOpen}
                    onOpenChange={setFilterSheetOpen}
                    initial={appliedFilters}
                    onApply={(f) => setAppliedFilters(f)}
                /> */}
    </>
}

export default page