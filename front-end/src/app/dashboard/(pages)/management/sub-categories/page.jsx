"use client";
import { useQueryFetch, useMutationFetch } from '@/hooks/useQueryFetch';
import useSearchPagination from '@/hooks/useSearchPagination';
import { setSubCategories, selectSubCategories } from '@/redux/slices/subCategoriesSlice';
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
import SubCategoryDialog from '@/components/ui/common/dialogs/subCategoryDialog';
import { useQueryClient } from '@tanstack/react-query';

const page = () => {
    const [visibleColumns, setVisibleColumns] = useState([]);
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'ar';
    
    // 1. Fetch SubCategories
    const { data: apiData, isLoading: isFetching } = useQueryFetch(['allSubCategories'], '/api/subcategory/withallname');
    
    const columns = [
        // { key: 'checkbox', title: '', width: 40 },
        { key: 'code', title: 'كود التصنيف الفرعي', width: 180,render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
        {
            key: 'image', title: 'صورة التصنيف الفرعي', width: 150, render: (r) => (
                <div className="flex items-center justify-center gap-2">
                    <Avatar><img src={r.image} alt={r.name} className="w-12 h-12 rounded-full object-cover" /></Avatar>
                </div>
            )
        },
    { key: 'name_AR', title: 'اسم التصنيف الفرعي (عربي)', width: 150 },
    { key: 'name_EN', title: 'اسم التصنيف الفرعي (إنجليزي)', width: 150 },
    { key: 'parentCategory_AR', title: 'التصنيف الرئيسي (عربي)', width: 150 },
    { key: 'parentCategory_EN', title: 'التصنيف الرئيسي (إنجليزي)', width: 150 },
    { key: 'actions', title: 'خيارات', width: 120 },
];

    useEffect(() => {
        setVisibleColumns(columns.map(c => c.key));
    }, []);

    // 2. Dispatch to Redux
    useEffect(() => {
        if (apiData?.data) {
            const subCategories = Array.isArray(apiData.data) 
                ? apiData.data 
                : (apiData.data.items || []);
            dispatch(setSubCategories(subCategories));
        }
    }, [apiData, dispatch]);

    const subCategories = useSelector(selectSubCategories);

    const mappedRows = (subCategories || []).map((c) => {
        const categories = c.categories || [];
        const parentCategory_AR = categories.map(cat => cat.name_AR || cat.name).filter(Boolean).join(', ');
        const parentCategory_EN = categories.map(cat => cat.name_EN || cat.name).filter(Boolean).join(', ');

        return {
            code: c.id,
            name_AR: c.name_AR || c.name,
            name_EN: c.name_EN || c.name,
            image: c.imgUrl,
            parentCategory_AR: parentCategory_AR || '-',
            parentCategory_EN: parentCategory_EN || '-',
            ...c
        }
    });

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
        fuseOptions: { keys: ["name_AR","name_EN","code","parentCategory_AR","parentCategory_EN"], threshold: 0.3 }
    });

    const isLoading = isFetching || isSearchLoading;

    const deleteMutation = useMutationFetch({
        url: (id) => ({
            url: `/api/subcategory`,
            method: 'DELETE',
            params: { Id: id }
        }),
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allSubCategories'] });
                queryClient.invalidateQueries({ queryKey: ['subCategories'] });

                toast.success( lang === 'en' ? "Sub Category deleted successfully" : "تم حذف التصنيف الفرعي بنجاح");
            },
            onError: (err) => {
                toast.error( lang === 'en' ? "Error deleting sub category" : "حدث خطأ أثناء حذف التصنيف الفرعي");
            }
        }
    });

    return <>
                <DashboardContentHeader
                    title={
                        <div className="flex items-center gap-2">
                            <span>إدارة التصنيفات الفرعية</span>
                            {isLoading && <Spinner />}
                        </div>
                    }
        
                    createButtonTitle="إضافة تصنيف فرعي"
                    createComponent={<SubCategoryDialog mode='create' />}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    onVisibleColumnsChange={setVisibleColumns}
                    apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
                    // apiFilter2={{ title: "تصفية", onClick: () => setFilterSheetOpen(true) }}
                    searchPlaceholder="ابحث في التصنيفات الفرعية..."
                    onSearch={(value) => setSearch(value)}
                />
                <DataTable
                    columns={columns}
                    data={searchedData}
                    visibleColumns={visibleColumns}
                    disableAccordion={true}
                    isLoading={isLoading}
        
                    // detailsComponentMap={{ supplier: SuppliersContent }}
                    rowDialog={<SubCategoryDialog />}
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