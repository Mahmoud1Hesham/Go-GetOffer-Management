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
import SuppliersContent from '@/components/ui/common/dataTable/contents/suppliers-content';

const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود المورد', width: 80 },
    {
        key: 'avatar', title: 'اسم الكيان', width: 150, render: (r) => (
            <div className="flex items-center gap-2">
                <Avatar><img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" /></Avatar>
                <div className="text-sm truncate">{r.name}</div>
            </div>
        )
    },
    {
        key: 'category', title: 'النشاط', width: 140, render: (r) => {
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
    { key: 'branch', title: 'الفرع الرئيسى', width: 90, render: (r) => <div>{r.branch}</div> },
    { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
    { key: 'accessed-from', title: 'وسيلة الوصول', width: 120, render: (r) => <div>{r.accessedFrom}</div> },
    { key: 'date', title: 'تاريخ الإنضمام', width: 140 },
    // details column removed - use DataTable `detailsComponentMap` prop instead
    {
        key: 'status', title: 'الحالة', width: 120, render: (r) => {
            const raw = String(r.status ?? '').trim();
            const lower = raw.toLowerCase();

            // Map common Arabic/English variants to states
            const isRejected = /رفض|مرفوض|rejected/.test(lower);
            const isApproved = /مقبول|موافق|approved|active/.test(lower);
            const isPending = /قيد الانتظار|قيد|pending/.test(lower);

            const base = 'px-3 py-5! text-xs rounded-xl';
            let classes = '';

            if (isRejected) {
                classes = `${base} bg-red-50 text-red-600`;
            } else if (isApproved) {
                classes = `${base} bg-green-50 text-green-500`;
            } else if (isPending) {
                classes = `${base} bg-[#FDEDCE] text-go-primary-o`;
            } else {
                // default / unknown -> pending-style fallback
                classes = `${base} bg-[#FDEDCE] text-go-primary-o`;
            }

            return <span className={classes}>{raw}</span>;
        }
    },
    { key: 'actions', title: 'خيارات', width: 120 },
];


const rows = [
    {
        id: '1', type: 'supplier', name: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 83513, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'المعادى', assignedTo: 'سارة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'العاشر من رمضان', governorate: 'القاهرة', branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
        ]
    },
    { id: '2', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', assignedTo: 'كريم', accessedFrom: 'مندوب', address: "السادس من أكتوبر", branches: ['السويس'], governorate: 'الجيزة', postalCode: '67890',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '3', type: 'supplier', name: 'أحمد علي عوضين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه', 'ادوات تنظيف'], status: 'مقبول', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'القاهرة', branches: ['مدينة نصر', 'المعادى'], postalCode: '11223',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '4', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'القاهرة', branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '33445',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '5', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', assignedTo: 'كريم', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'معادى', governorate: 'القاهرة', branches: ['المعادى', 'القاهرة الجديدة'], postalCode: '55667', rejectionReasons: ['missing_docs', 'expired_docs'], docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '6', type: 'supplier', name: 'أحمد علي حسنين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'مندوب', address: 'القاهرة الجديدة', governorate: 'القاهرة', branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '77889',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '7', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'الدقي', governorate: 'جيزة', branches: ['الدقي', 'الجيزة'], postalCode: '99000',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '8', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'تعبئه وتغليف'], status: 'مرفوض', branch: 'جيزة', assignedTo: 'كريم', accessedFrom: 'مندوب', address: 'فيصل', governorate: 'الجيزة', branches: ['فيصل', 'الجيزة'], postalCode: '10101', rejectionReasons: ['mismatch'], docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '9', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'بوفيه'], status: 'قيد الانتظار', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'القاهرة', branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '10', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه'], status: 'مرفوض', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'القاهرة', branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['does_not_match_the_requirements', 'repeated_request'], docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '11', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', assignedTo: 'ليلى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'القاهرة', branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223',docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
    { id: '12', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', assignedTo: 'سارة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'القاهرة', branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['incomplete'], docs : [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
        ] },
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
        title: "الموردون المعتمدون",
        value: 40,
        unit: "مورد",
        note: "78% من إجمالي الموردين",
        icon: FaUserCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
    },
    {
        id: "under_review_suppliers",
        title: "الموردون تحت المراجعة",
        value: 8,
        unit: "مورد",
        note: "شركة النخبة للتوريد",
        icon: FaAward,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
    },
    {
        id: "on_time_rate",
        title: "الموردون المرفوضون",
        value: 12,
        unit: "مورد",
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
            detailsComponentMap={{ supplier: SuppliersContent }}
            pageSizeOptions={[5, 10, 25]}
            initialPageSize={5}
            // totalRows={80} // لو server-side pagination
            onPageChange={(page, size) => console.log('page', page, 'size', size)}
            onSelectionChange={(sel) => console.log('selected', sel)}
            onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
        />
    </>
}

export default page