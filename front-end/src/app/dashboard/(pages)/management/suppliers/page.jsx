"use client";
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { mapActivityValues } from '@/lib/activitiesMapper'
import { FaPeopleGroup, FaUserCheck, FaAward } from "react-icons/fa6";
import { PiUserMinusLight } from "react-icons/pi";
import DashCardGroup from '@/components/ui/common/dashCard/dashCardGroup';
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import SupplierDialog from '@/components/ui/common/dialogs/supplierDialog'

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import SuppliersContent from '@/components/ui/common/dataTable/contents/suppliers-content';
import { useDispatch, useSelector } from 'react-redux'
import { fetchSuppliers, deleteSupplier } from '@/redux/slices/supplierManagementSlice'
import UnifiedFilterSheet from '@/components/ui/filters/UnifiedFilterSheet'
import { applyFilters } from '@/components/ui/filters/filter.service'
import useSearchPagination from '@/hooks/useSearchPagination'

const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود المورد', width: 120 },
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
            const cats = Array.isArray(r.categoryLabel) ? r.categoryLabel : (r.categoryLabel ? [r.categoryLabel] : []);
            if (cats.length === 0) return <Badge variant={'outline'} className="px-3 py-1 text-xs">فارغ</Badge>;
            if (cats.length === 1) return <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]}</Badge>;

            // show first category with +N together in a single centered badge
            return (
                <div className="flex items-center justify-center font-figtree">
                    <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]} + {cats.length - 1}</Badge>
                </div>
            );
        }
    },
    { key: 'branch', title: 'الفرع الرئيسى', width: 90, render: (r) => <div>{r.branch}</div> },
    // { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
    // { key: 'accessed-from', title: 'وسيلة الوصول', width: 120, render: (r) => <div>{r.accessedFrom}</div> },
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
const statsConfig = [
    {
        id: "total_suppliers",
        title: "إجمالي الموردين",
        value: 100,
        unit: "مورد",
        note: "+ هذا الشهر",
        icon: FaPeopleGroup,
        iconBg: "bg-go-bg-l-e",
        iconColor: "text-go-primary-g"
    },
    {
        id: "active_suppliers",
        title: "الموردون المعتمدون",
        value: 40,
        unit: "مورد",
        note: "  من إجمالي الموردين",
        icon: FaUserCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
    },
    {
        id: "under_review_suppliers",
        title: "الموردون تحت المراجعة",
        value: 8,
        unit: "مورد",
        note: "خلال آخر 30 يوم ",
        icon: FaAward,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
    },
    {
        id: "rejected_suppliers",
        title: "الموردون المرفوضون",
        value: 12,
        unit: "مورد",
        note: "خلال آخر 30 يوم ",
        icon: PiUserMinusLight,
        iconBg: "bg-red-100",
        iconColor: "text-go-primary-cancel"
    },
];

const page = () => {
    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
    const [filterSheetOpen, setFilterSheetOpen] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState({});
    const dispatch = useDispatch()
    const supplierState = useSelector((s) => s.supplierManagement || {})
    const searchParams = useSearchParams()
    const lang = searchParams.get('lang') || 'en'


    useEffect(() => {
        // fetch suppliers on mount so you can inspect the report below
        // debug log to confirm useEffect ran and dispatch is called
        // eslint-disable-next-line no-console
        console.log('Suppliers page mounted — dispatching fetchSuppliers')
        dispatch(fetchSuppliers())
    }, [dispatch])

    const mappedRows = (supplierState.suppliers || []).map((s) => {
        // build docs from commercial registration and tax card URLs + publicIds
        const docs = [];
        const crUrls = Array.isArray(s.commercialRegistrationDocumentUrl) ? s.commercialRegistrationDocumentUrl : [];
        const crIds = Array.isArray(s.commercialRegistrationDocumentPublicId) ? s.commercialRegistrationDocumentPublicId : [];
        crUrls.forEach((u, i) => { if (u) docs.push({ id: `cr${i}`, type: 'image', src: u, title: crIds[i] || `commercial_${i}` }); });
        const taxUrls = Array.isArray(s.taxCardDocumentUrl) ? s.taxCardDocumentUrl : [];
        const taxIds = Array.isArray(s.taxCardDocumentPublicId) ? s.taxCardDocumentPublicId : [];
        taxUrls.forEach((u, i) => { if (u) docs.push({ id: `tax${i}`, type: 'image', src: u, title: taxIds[i] || `tax_${i}` }); });

        return {
            id: s.supplierId,
            type: s.type || 'supplier',
            name: s.companyName || '—',
            fullName: s.fullName || '',
            // prefer explicit logo/profile image fields; avoid using commercial registration docs as avatar
            avatar:
                s.logoUrl || s.avatar || s.profileImage || s.profileImageUrl ||
                (s._raw && s._raw.supplierProfile && s._raw.supplierProfile[0] && (
                    s._raw.supplierProfile[0].logoUrl || s._raw.supplierProfile[0].profileImageUrl
                )) ||
                'https://avatars.githubusercontent.com/u/124599?v=4',
            code: s.code || s.companyNumber || '',
            // human-friendly display date and a raw ISO date for filtering
            date: s.joinDate ? new Date(s.joinDate).toLocaleDateString('ar-EG') : '',
            dateRaw: s.joinDate || null,
            // category should display activities
            // keep raw keys for filtering, provide `categoryLabel` for display/localized labels
            category: s.activities || s.categories || [],
            categoryLabel: mapActivityValues(s.activities || s.categories || [], lang),
            status: (() => {
                const raw = String(s.status ?? '').trim().toLowerCase();
                if (/قيد|pending/.test(raw)) return 'قيد الإنتظار'
                if (/مقبول|approved|accepted|active|موافق/.test(raw)) return 'مقبول'
                if (/مرفوض|rejected|رفض/.test(raw)) return 'مرفوض'
                return s.status || ''
            })(),
            branch: s.branchName || '',
            assignedTo: '',
            accessedFrom: '',
            address: s.addressDetails || '',
            governorate: s.governorate || '',
            city: s.city || '',
            phoneNumbers: Array.isArray(s.phoneNumbers) && s.phoneNumbers.length ? s.phoneNumbers[0] : '',
            phone: s.companyNumber || '',

            email: s.email || '',
            activities: s.categories || s.activities || [],
            branches: s.branches || [],
            postalCode: s.postalCode || '',
            docs: docs,
            rejectionReasons: s.rejectionReasons ? (Array.isArray(s.rejectionReasons) ? s.rejectionReasons : [s.rejectionReasons]) : undefined,
            supplierJoinRequestId: s.supplierJoinRequestId,

            minimumItemInInvoice: s.minimumItemInInvoice,
            minimumInvoiceAmount: s.minimumInvoiceAmount,
            maximumInvoiceAmount: s.maximumInvoiceAmount,
            maximumProcessingDays: s.maximumProcessingDays,
            hasElectronicInvoice: s.hasElectronicInvoice,
            hasDeliveryService: s.hasDeliveryService,
        }
    })

    const dataForTable = mappedRows;

    // apply filters client-side (categories, date range, status)
    const filteredData = React.useMemo(() => {
        if (!appliedFilters || Object.keys(appliedFilters).length === 0) return dataForTable;
        return applyFilters(dataForTable, appliedFilters)
    }, [dataForTable, appliedFilters])

    const fuseOptions = { keys: ["name", "code", "branch", "category"], threshold: 0.35 };
    // Wire unified search + pagination hook in OFFLINE mode for testing.
    // We pass the already-filtered dataset as `data` so the hook performs
    // client-side search (Fuse) and pagination on top of existing filters.
    const {
        data: pagedData,
        searchedData,
        total,
        page,
        limit,
        setSearch,
        setPage,
        setLimit,
        isLoading,
        isOnline
    } = useSearchPagination({
        queryKey: 'suppliers',
        isOnline: false,
        initialLimit: 5,
        data: filteredData,
        fuseOptions
    })

    const combinedStats = React.useMemo(() => {
        const sb = Array.isArray(supplierState.statusBar) ? supplierState.statusBar : [];
        const baseMap = new Map(statsConfig.map(item => [item.id, { ...item }]));

        sb.forEach((item, idx) => {
            const id = item.statusKey || item.id || `sb_${idx}`;
            const value = item.statusBarValue ?? item.value ?? item.count ?? 0;
            const note = item.statusBarNote || item.note || '';

            const existing = baseMap.get(id);
            if (existing) {
                existing.value = value;
                // preserve both the base note and the server-provided note
                const baseNote = existing.note ? String(existing.note).trim() : '';
                const serverNote = note ? String(note).trim() : '';
                existing.note = [serverNote, baseNote].filter(Boolean).join('  ');
            } else {
                baseMap.set(id, {
                    id,
                    value,
                    unit: 'مورد',
                    note,
                    icon: FaPeopleGroup,
                    iconBg: 'bg-go-bg-l-e',
                    iconColor: 'text-go-primary-g'
                });
            }
        });

        // Preserve base order, then append any new statusBar-only entries.
        const ordered = statsConfig.map(i => baseMap.get(i.id));
        const appended = [];
        for (const [k, v] of baseMap.entries()) {
            if (!statsConfig.find(i => i.id === k)) appended.push(v);
        }
        return [...ordered, ...appended];
    }, [supplierState.statusBar]);

    const selectedStatsIds = combinedStats.map(c => c.id);

    return <>
        {/* <ContentSkeleton /> */}
        <DashCardGroup statsConfig={combinedStats} selected={selectedStatsIds} />
        <DashboardContentHeader
            title="إدارة الموردين"
            createButtonTitle="إضافة مورد"
            createComponent={<SupplierDialog />}
            columns={columns}
            visibleColumns={visibleColumns}
            onVisibleColumnsChange={setVisibleColumns}
            apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
            apiFilter2={{ title: "تصفية", onClick: () => setFilterSheetOpen(true) }}
            searchPlaceholder="ابحث في الموردين..."
            onSearch={(value) => setSearch(value)}
        />
        <DataTable
            columns={columns}
            visibleColumns={visibleColumns}
            data={searchedData}
            detailsComponentMap={{ supplier: SuppliersContent }}
            rowDialog={<SupplierDialog />}
            onDelete={(id) => {
                try {
                    console.log('Deleting supplier with id:', id);
                    dispatch(deleteSupplier(id));
                    dispatch(fetchSuppliers());
                } catch (error) {
                    console.error('Error logging supplier id for deletion:', error);
                }
            }}

            pageSizeOptions={[5, 10, 25]}
            initialPageSize={limit}
            totalRows={searchedData?.length || 0}
            onPageChange={(page, size) => { setPage(page); setLimit(size); }}
            onSelectionChange={(sel) => console.log('selected', sel)}
            onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
        />
        <UnifiedFilterSheet
            open={filterSheetOpen}
            onOpenChange={setFilterSheetOpen}
            initial={appliedFilters}
            onApply={(f) => setAppliedFilters(f)}
        />
        {/* Debug panel: full supplier slice report from API */}
        <div className="mt-6 p-4 bg-slate-50 rounded text-xs">
            <div className="mb-2 font-semibold">Supplier slice debug (raw):</div>
            <pre className="whitespace-pre-wrap max-h-96 overflow-auto text-[11px]">{JSON.stringify({
                status: supplierState.status,
                message: supplierState.message,
                loading: supplierState.loading,
                error: supplierState.error,
                statusBar: supplierState.statusBar,
                suppliers: supplierState.suppliers
            }, null, 2)}</pre>
        </div>
    </>
}

export default page



