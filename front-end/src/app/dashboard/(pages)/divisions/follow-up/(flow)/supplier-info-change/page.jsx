"use client";

import React, { useState, useMemo } from 'react';
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import SupplierInfoChangeContent from '@/components/ui/common/dataTable/contents/supplier-info-change-content';
import { applyFilters } from '@/components/ui/filters/filter.service';
import { useQueryFetch } from '@/hooks/useQueryFetch';
import useRefreshCooldown from '@/hooks/useRefreshCooldown';

const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'requestCode', title: 'كود الطلب', width: 120 },
    { key: 'entityName', title: 'اسم الكيان', width: 200 },
    { key: 'changeType', title: 'نوع التغيير', width: 150 },
    { key: 'requestTime', title: 'موعد الطلب', width: 180 },
    {
        key: 'status', title: 'الحالة', width: 120, render: (r) => {
            const raw = String(r.status ?? '').trim();
            const lower = raw.toLowerCase();

            const isRejected = /رفض|مرفوض/.test(lower);
            const isApproved = /مقبول/.test(lower);
            const isPending = /قيد الانتظار|قيد/.test(lower);

            const base = 'px-3 py-1 text-xs rounded-xl';
            let classes = '';

            if (isRejected) {
                classes = `${base} bg-red-50 text-red-600`;
            } else if (isApproved) {
                classes = `${base} bg-green-50 text-green-500`;
            } else if (isPending) {
                classes = `${base} bg-[#FDEDCE] text-amber-600`;
            } else {
                classes = `${base} bg-gray-100 text-gray-600`;
            }

            return <span className={classes}>{raw}</span>;
        }
    },
];

export default function SupplierInfoChangePage() {
    const [activeTab, setActiveTab] = useState('all');
    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
    // DataTable uses zero-based pageIndex internally. Keep parent zero-based
    // and map to API's 1-based `Page` param when calling the backend.
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch all items once (offline pagination). Keep `activeTab` in the
    // query key so switching tabs refetches, but avoid refetches on DataTable
    // page changes by not including `pageIndex`/`pageSize` in the key.
    const { data: responseData, isLoading, refetch } = useQueryFetch(
        ['supplier-info-changes', activeTab],
        '/api/UserUpdateRequest/requests',
        { params: { Page: 1, PageSize: 10000 } }
    );

    const { onClick: handleRefetchWithCooldown, title: refreshTitle, disabled: refreshDisabled } = useRefreshCooldown({ refetch, successMessage: 'تم التحديث بنجاح' });


    const apiData = useMemo(() => {
        if (!responseData?.data?.items) return [];
                return responseData.data.items.map(item => {
            // Mapping status
            let status = 'قيد الانتظار';
            if (item.isApproved === 'Approved' || item.isApproved === 'مقبول' || item.isApproved === true) status = 'مقبول';
            if (item.isApproved === 'Rejected' || item.isApproved === 'مرفوض' || item.isApproved === false) status = 'مرفوض';

            // Return mapped item to match table structure and content component
            return {
                id: item.requestId || item.id,
                type: 'infoChange',
                requestCode: (item.requestId || item.id || '').split('-')[0] || (item.requestId || item.id), // Or however you want to display ID
                entityName: item.companyName,
                changeType: item.profileUpdateType,
                requestTime: new Date(item.requestedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                status: status,
                oldValue: item.currentValue,
                newValue: item.newUpdate,
                userComment: item.userComment,
                adminComment: item.adminComment,
                authenticationUserId: item.authenticationUserId,
                isApproved: item.isApproved,
                decisionAt: item.decisionAt ? new Date(item.decisionAt).toLocaleDateString('ar-EG') : null
            };
        });
    }, [responseData]);

    const tabs = [
        { value: 'pending', label: 'قيد الانتظار' },
        { value: 'approved', label: 'مقبول' },
        { value: 'rejected', label: 'مرفوض' },
        { value: 'all', label: 'عرض الكل' }
    ];

    const filteredData = useMemo(() => {
        let statusFilter = '';
        if (activeTab === 'pending') statusFilter = 'قيد الانتظار';
        if (activeTab === 'approved') statusFilter = 'مقبول';
        if (activeTab === 'rejected') statusFilter = 'مرفوض';

        let data = apiData;
        if (statusFilter) data = applyFilters(data, { status: statusFilter });

        // client-side search for offline pagination mode
        const q = String(searchQuery || '').trim().toLowerCase();
        if (!q) return data;

        return data.filter(d => {
            return String(d.requestCode || '').toLowerCase().includes(q)
                || String(d.entityName || '').toLowerCase().includes(q)
                || String(d.changeType || '').toLowerCase().includes(q)
                || String(d.status || '').toLowerCase().includes(q);
        });
    }, [apiData, activeTab, searchQuery]);

    return (
        <div className="flex gap-4 items-center flex-col">
            <DashboardContentHeader
                title={
                    <div className="flex items-center gap-2">
                        <span>طلبات تغيير بيانات الموردين</span>
                    </div>
                }
                columns={columns}
                visibleColumns={visibleColumns}
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onVisibleColumnsChange={setVisibleColumns}
                apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => { } }}
                apiRefresh={{ title: refreshTitle, onClick: handleRefetchWithCooldown, disabled: refreshDisabled, isLoading: isLoading }}
                searchPlaceholder="ابحث في الطلبات..."
                onSearch={(value) => setSearchQuery(value)}
            />
            <DataTable
                columns={columns}
                visibleColumns={visibleColumns}
                data={filteredData}
                isLoading={isLoading}
                detailsComponentMap={{ infoChange: (props) => <SupplierInfoChangeContent {...props} refetch={refetch} /> }}
                pageSizeOptions={[5, 10, 25]}
                initialPageSize={pageSize}
                onPageChange={(p, size) => { setPageIndex(p); setPageSize(size); }}
            />
        </div>
    );
}