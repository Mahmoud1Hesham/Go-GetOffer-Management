"use client";
import { useQueryFetch, useMutationFetch } from '@/hooks/useQueryFetch';
import useRefreshCooldown from '@/hooks/useRefreshCooldown';
import useSearchPagination from '@/hooks/useSearchPagination';
import { setBrands, selectBrands } from '@/redux/slices/brandsSlice';
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
import BrandDialog from '@/components/ui/common/dialogs/brandDialog';
import { useQueryClient } from '@tanstack/react-query';

const columns = [
    // { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود العلامة التجارية', width: 180,render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
    {
        key: 'image', title: 'صورة العلامة التجارية', width: 150, render: (r) => (
            <div className="flex items-center justify-center gap-2">
                <Avatar><img src={r.image} alt={r.name} className="w-12 h-12 rounded-full object-cover" /></Avatar>
            </div>
        )
    },
    { key: 'name_AR', title: 'اسم العلامة التجارية (عربي)', width: 100 },
    { key: 'name_EN', title: 'اسم العلامة التجارية (إنجليزي)', width: 120 },
    { key: 'categoryName_AR', title: 'التصنيف الرئيسي (عربي)', width: 100 },
    { key: 'categoryName_EN', title: 'التصنيف الرئيسي (إنجليزي)', width: 120 },
    { key: 'subCategoryName_AR', title: 'التصنيف الفرعي (عربي)', width: 100 },
    { key: 'subCategoryName_EN', title: 'التصنيف الفرعي (إنجليزي)', width: 120 },
    { key: 'actions', title: 'خيارات', width: 120 },
];

const page = () => {
    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});
    const dispatch = useDispatch();
    const queryClient = useQueryClient()
    const searchParams = useSearchParams();
    const lang = searchParams.get('lang') || 'ar';
    
    // 1. Fetch Brands
    const { data: apiData, isLoading: isInitialFetching, isFetching: isApiFetching, refetch } = useQueryFetch(['allBrands'], '/api/brand/withallname');
    const { onClick: handleBrandsRefresh, title: refreshTitleBrands, disabled: refreshDisabledBrands } = useRefreshCooldown({ refetch, successMessage: 'تم تحديث العلامات التجارية' });

    // 2. Dispatch to Redux
    useEffect(() => {
        if (apiData?.data) {
            const brands = Array.isArray(apiData.data) 
                ? apiData.data 
                : (apiData.data.items || []);
            dispatch(setBrands(brands));
        }
    }, [apiData, dispatch]);

    const brands = useSelector(selectBrands);

    const mappedRows = (brands || []).map((c) => {
        const subCategories = c.subCategories || [];
        
        const uniqueCategoriesMap = new Map();
        subCategories.forEach(sc => {
            (sc.categories || []).forEach(cat => {
                uniqueCategoriesMap.set(cat.id || cat.categoryKey, cat);
            });
        });
        const categories = Array.from(uniqueCategoriesMap.values());

        const subCategoryNames_AR = subCategories.map(sc => sc.name_AR || sc.name).filter(Boolean).join(', ');
        const subCategoryNames_EN = subCategories.map(sc => sc.name_EN || sc.name).filter(Boolean).join(', ');

        const categoryNames_AR = categories.map(cat => cat.name_AR || cat.name).filter(Boolean).join(', ');
        const categoryNames_EN = categories.map(cat => cat.name_EN || cat.name).filter(Boolean).join(', ');


        return {
            code: c.id,
            name_AR: c.name_AR || c.name,
            name_EN: c.name_EN || c.name,
            image: c.imgUrl,
            categoryName_AR: categoryNames_AR || '-',
            categoryName_EN: categoryNames_EN || '-',
            subCategoryName_AR: subCategoryNames_AR || '-',
            subCategoryName_EN: subCategoryNames_EN || '-',
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
        fuseOptions: { keys: ["name_AR", "name_EN", "code", "categoryName_AR", "categoryName_EN", "subCategoryName_AR", "subCategoryName_EN"], threshold: 0.3 }
    });

    const isLoading = isInitialFetching || isSearchLoading;

    const deleteMutation = useMutationFetch({
        url: (id) => ({
            url: `/api/brand`,
            method: 'DELETE',
            params: { Id: id }
        }),
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allBrands'] });
                queryClient.invalidateQueries({ queryKey: ['brands'] });

                toast.success(lang === 'en' ? "Brand deleted successfully" : "تم حذف العلامة التجارية بنجاح");
            },
            onError: (err) => {
                toast.error(lang === 'en' ? "Error deleting brand" : "حدث خطأ أثناء حذف العلامة التجارية");
            }
        }
    });

    return <>
                <DashboardContentHeader
                    title={
                        <div className="flex items-center gap-2">
                            <span>إدارة العلامات التجارية</span>
                            {isLoading && <Spinner />}
                        </div>
                    }
        
                    createButtonTitle="إضافة علامة تجارية"
                    createComponent={<BrandDialog mode='create' />}
                    columns={columns}
                    visibleColumns={visibleColumns}
                    onVisibleColumnsChange={setVisibleColumns}
                    apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
                    // apiFilter2={{ title: "تصفية", onClick: () => setFilterSheetOpen(true) }}
                    apiRefresh={{ title: refreshTitleBrands, onClick: handleBrandsRefresh, isLoading: isApiFetching, disabled: refreshDisabledBrands }}
                    searchPlaceholder="ابحث في العلامات التجارية..."
                    onSearch={(value) => setSearch(value)}
                />
                <DataTable
                    columns={columns}
                    data={searchedData}
                    visibleColumns={visibleColumns}
                    disableAccordion={true}
                    isLoading={isLoading}
        
                    // detailsComponentMap={{ supplier: SuppliersContent }}
                    rowDialog={<BrandDialog />}
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