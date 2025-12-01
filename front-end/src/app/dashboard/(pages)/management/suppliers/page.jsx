"use client";
import ContentSkeleton from '@/components/ui/common/content-skeleton/content-skeleton.jsx'
import React from 'react'
import { FaPeopleGroup, FaUserCheck, FaAward } from "react-icons/fa6";
import { FaShippingFast } from "react-icons/fa";
import DashCardGroup from '@/components/ui/common/dashCard/dashCardGroup';
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DataTableRunner from '@/components/ui/common/dataTable/dataTableRunner';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/ui/common/dataTable/dataTable';

const columns = [
    { key: 'checkbox', title: '', span: 1, width: '36px' },
    { key: 'code', title: 'كود المورد', span: 1 },
    {
        key: 'avatar', title: 'اسم الكيان', span: 2, render: (r) => (
            <div className="flex items-center gap-2">
                <Avatar><img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" /></Avatar>
                <div className="text-sm">{r.name}</div>
            </div>
        )
    },
    { key: 'badge', title: 'النشاط', span: 2, render: (r) => <Badge variant={'outline'} className="px-2 py-1 text-xs truncate">{r.badge}</Badge> },
    { key: 'details', title: 'الفرع الرئيسى', span: 1, render: (r) => <div>{r.notes}</div> },
    { key: 'date', title: 'تاريخ الإنضمام', span: 2},
    {
        key: 'coloredBadge', title: 'الحالة', span: 2, render: (r) => (
            <span className="px-2 py-0.5 text-xs rounded-md bg-yellow-50 text-yellow-800">{r.status}</span>
        )
    },
    { key: 'actions', title: 'خيارات', span: 1 },
];


const rows = [
    { id: '1', name: 'محمد سمير', avatar: '/img1.jpg', code: 83513, date: '25 نوفمبر 2025', badge: 'منتجات غذائية', status: 'قيد الانتظار',notes: 'المعادى' },
    { id: '2', name: 'أحمد علي', avatar: '/img2.jpg', code: 44607, date: '25 نوفمبر 2025', badge: 'منتجات غذائية', status: 'مفعل', notes: 'جيزة' },
    // ...
];
const statsConfig = [
    {
        id: "total_suppliers",
        title: "إجمالي الموردين",
        value: 100,
        unit: "مورد",
        note: "هذا الشهر 12+",
        icon: FaPeopleGroup,
        iconBg: "bg-go-bg-l-e",
        iconColor: "text-go-primary-g"
    },
    {
        id: "active_suppliers",
        title: "الموردون النشطون",
        value: 40,
        unit: "مورد",
        note: "78% من إجمالي الموردين",
        icon: FaUserCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
    },
    {
        id: "top_rated",
        title: "المورد الأعلى تقييماً",
        value: 8,
        unit: "مورد",
        note: "شركة النخبة للتوريد",
        icon: FaAward,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
    },
    {
        id: "on_time_rate",
        title: "معدل الالتزام بالمواعيد",
        value: "90%",
        unit: "",
        note: "خلال آخر 30 يوم",
        icon: FaShippingFast,
        iconBg: "bg-go-bg-l-e",
        iconColor: "text-go-primary-e"
    },
];

const page = () => {
    return <>
        {/* <ContentSkeleton /> */}
        <DashCardGroup statsConfig={statsConfig} />
        <DashboardContentHeader
            title="إدارة الموردين"
            createButtonTitle="إضافة مورد"
            apiCreate={() => console.log("create")}
            apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
            apiFilter2={{ title: "تصفية الأعمدة", onClick: () => console.log("filter 2") }}
            searchPlaceholder="ابحث في الموردين..."
            onSearch={(value) => console.log(value)}
        />
        <DataTable
            columns={columns}
            data={rows}
            pageSizeOptions={[5, 10, 25]}
            initialPageSize={5}
            totalRows={80} // لو server-side pagination
            onPageChange={(page, size) => console.log('page', page, 'size', size)}
            onSelectionChange={(sel) => console.log('selected', sel)}
            onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
        />    </>
}

export default page