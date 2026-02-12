"use client";
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DashCardGroup from '@/components/ui/common/dashCard/dashCardGroup';
import SuppliersContent from '@/components/ui/common/dataTable/contents/suppliers-content';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import UnifiedFilterSheet from '@/components/ui/filters/UnifiedFilterSheet'
import { applyFilters } from '@/components/ui/filters/filter.service'
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { mapActivityValues } from '@/lib/activitiesMapper'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSupplierJoinRequests, selectStatusBar, selectItems, syncSupplierJoinRequests } from '@/redux/slices/supplierJoinRequestsSlice'
import { FaPeopleGroup } from 'react-icons/fa6';
import { PiClockUser, PiUserMinusLight, PiUserPlus } from 'react-icons/pi';
import { useQueryFetch } from '@/hooks/useQueryFetch';
import Spinner from '@/components/ui/common/spinner/spinner';

const SuppliersContentNoConditions = (props) => <SuppliersContent {...props} showConditions={false} />;

const columns = [
  { key: 'checkbox', title: '', width: 40 },
  { key: 'code', title: 'كود المورد', width: 120 },
  {
    key: 'avatar', title: 'اسم الكيان', width: 180, render: (r) => (
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
        <div className="flex items-center justify-center">
          <Badge variant={'outline'} className="px-3 py-1 text-xs">{cats[0]} + {cats.length - 1}</Badge>
        </div>
      );
    }
  },
  { key: 'branch', title: 'الفرع الرئيسى', width: 120, render: (r) => <div>{r.branch}</div> },
  // { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
  // { key: 'accessed-from', title: 'وسيلة الوصول', width: 180, render: (r) => <div>{r.accessedFrom}</div> },
  { key: 'date', title: 'تاريخ الإنضمام', width: 170 },
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
        classes = `${base} bg-[#FDEDCE] text-go-primary-o`;
      }

      return <span className={classes}>{raw}</span>;
    }
  },
  // { key: 'actions', title: 'خيارات', width: 120 },
];


// const rows = [
//   {
//     id: '1', type: 'supplier', name: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 83513, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'المعادى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '2', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', accessedFrom: 'مندوب', address: "السادس من أكتوبر", governorate: 'giza', city: 'haram', phone: '01010000002', fullName: 'أحمد علي', email: 'supplier2@example.com', activities: ['food products'], branches: ['السويس'], postalCode: '67890', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '3', type: 'supplier', name: 'أحمد علي عوضين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه', 'ادوات تنظيف'], status: 'مقبول', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'maadi', phone: '01010000003', fullName: 'أحمد علي عوضين', email: 'supplier3@example.com', activities: ['food products', 'office supplies', 'buffet', 'cleaning supplies'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '4', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'nasr', phone: '01010000004', fullName: 'أحمد علي', email: 'supplier4@example.com', activities: ['food products'], branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '33445', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '5', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'معادى', governorate: 'cairo', city: 'maadi', phone: '01010000005', fullName: 'أحمد علي', email: 'supplier5@example.com', activities: ['food products'], branches: ['المعادى', 'القاهرة الجديدة'], postalCode: '55667', rejectionReasons: ['missing_docs', 'expired_docs'], docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '6', type: 'supplier', name: 'أحمد علي حسنين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', accessedFrom: 'مندوب', address: 'القاهرة الجديدة', governorate: 'cairo', city: 'nasr', phone: '01010000006', fullName: 'أحمد علي حسنين', email: 'supplier6@example.com', activities: ['food products'], branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '77889', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '7', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'الدقي', governorate: 'giza', city: 'giza-city', phone: '01010000007', fullName: 'أحمد علي', email: 'supplier7@example.com', activities: ['food products'], branches: ['الدقي', 'الجيزه'], postalCode: '99000', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '8', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'تعبئه وتغليف'], status: 'مرفوض', branch: 'جيزة', accessedFrom: 'مندوب', address: 'فيصل', governorate: 'alex', city: 'sidi', phone: '01010000008', fullName: 'أحمد علي', email: 'supplier8@example.com', activities: ['food products', 'packaging materials'], branches: ['فيصل', 'الجيزة'], postalCode: '10101', rejectionReasons: ['mismatch'], docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '9', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'بوفيه'], status: 'قيد الانتظار', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'nasr', phone: '01010000009', fullName: 'أحمد علي', email: 'supplier9@example.com', activities: ['food products', 'buffet'], branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '10', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه'], status: 'مرفوض', branch: 'جيزة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'maadi', phone: '01010000010', fullName: 'أحمد علي', email: 'supplier10@example.com', activities: ['food products', 'office supplies', 'buffet'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['does_not_match_the_requirements', 'repeated_request'], docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '11', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'nasr', phone: '01010000011', fullName: 'أحمد علي', email: 'supplier11@example.com', activities: ['food products'], branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223', docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
//   {
//     id: '12', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'nasr', phone: '01010000012', fullName: 'أحمد علي', email: 'supplier12@example.com', activities: ['food products'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['incomplete'], docs: [
//       { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
//       { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
//       { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
//       { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
//     ]
//   },
// ];

const statsConfig = [
  {
    id: "total_requests",
    title: "إجمالي الطلبات",
    value: 12,
    unit: "طلب",
    note: "إجمالي عدد طلبات انضمام الموردين المستلمة",
    icon: FaPeopleGroup, // change icon to sutable one
    iconBg: "bg-go-bg-l-e",
    iconColor: "text-go-primary-g"
  },
  {
    id: "accepted_requests",
    title: "طلبات مقبولة",
    value: 100,
    unit: "طلب",
    note: "عدد الطلبات التى تم إعتمادها بنجاح",
    icon: PiUserPlus,
    iconBg: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    id: "pending_requests",
    title: "طلبات قيد الانتظار",
    value: 40,
    unit: "طلب",
    note: "طلبات لا تزال قيد المراجعة والمعالجة",
    icon: PiClockUser,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600"
  },
  {
    id: "rejected_requests",
    title: "طلبات مرفوضة",
    value: 8,
    unit: "طلب",
    note: "عدد الطلبات التي تم رفضها بعد المراجعة",
    icon: PiUserMinusLight,
    iconBg: "bg-red-100",
    iconColor: "text-go-primary-cancel"
  },
];



const page = () => {
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [activeTab, setActiveTab] = useState('all');
  const dispatch = useDispatch()
  const statusBar = useSelector(selectStatusBar)
  const items = useSelector(selectItems)
  const loading = useSelector((s) => s.supplierJoinRequests?.loading)
  const error = useSelector((s) => s.supplierJoinRequests?.error)
  const searchParams = useSearchParams()
  const lang = searchParams.get('lang') || 'ar';

  const { data: fetchedData, isLoading: isFetchLoading } = useQueryFetch('supplierJoinRequests', '/api/SupplierJoinRequest');

  useEffect(() => {
    if (fetchedData) {
      dispatch(syncSupplierJoinRequests(fetchedData));
    }
  }, [fetchedData, dispatch])

  const rawItems = items ? (Array.isArray(items) ? items : (items.items || [])) : [];

  const mappedRows = rawItems.map((s) => {
    const profile = s.supplierProfile || {};
    const branch = s.mainBranch || {};
    const docs = [];
    const crUrls = Array.isArray(profile.commercialRegistrationDocumentUrl) ? profile.commercialRegistrationDocumentUrl : [];
    const crIds = Array.isArray(profile.commercialRegistrationDocumentPublicId) ? profile.commercialRegistrationDocumentPublicId : [];
    crUrls.forEach((u, i) => { if (u) docs.push({ id: `cr${i}`, type: 'image', src: u, title: crIds[i] || `commercial_${i}` }); });
    const taxUrls = Array.isArray(profile.taxCardDocumentUrl) ? profile.taxCardDocumentUrl : [];
    const taxIds = Array.isArray(profile.taxCardDocumentPublicId) ? profile.taxCardDocumentPublicId : [];
    taxUrls.forEach((u, i) => { if (u) docs.push({ id: `tax${i}`, type: 'image', src: u, title: taxIds[i] || `tax_${i}` }); });

    return {
      id: s.requestId,
      type: s.userType ? s.userType.toLowerCase() : 'supplier',
      name: s.name || s.email || '—',
      fullName: profile.fullName || '',
      avatar: profile.logoUrl || s.avatar || 'https://avatars.githubusercontent.com/u/124599?v=4',
      code: profile.code || '',
      date: s.requestedAt ? new Date(s.requestedAt).toLocaleDateString('en-EG') : '',
      dateRaw: s.requestedAt || null,
      // keep raw keys for filtering and provide localized labels for display
      category: (profile.activityType || []).map(t => String(t).toLowerCase().trim().replace(/\s+/g, '_')),
      categoryLabel: mapActivityValues(profile.activityType || [], lang),
      status: (() => {
        const raw = String(s.requestStatus || '').trim().toLowerCase();
        if (/قيد|pending/.test(raw)) return 'قيد الإنتظار'
        if (/مقبول|approved|accepted|active|موافق/.test(raw)) return 'مقبول'
        if (/مرفوض|rejected|رفض/.test(raw)) return 'مرفوض'
        return s.requestStatus || ''
      })(),
      branch: branch.branchName || '',
      accessedFrom: '',
      address: branch.addressDetails || '',
      governorate: branch.governorate || '',
      city: branch.city || '',
      phone: s.number || '',
      email: s.email || '',
      activities: profile.activityType || [],
      branches: [],
      postalCode: branch.postalCode || '',
      docs,
      rejectionReasons: s.rejectionReasons || undefined,
      supplierJoinRequestId: s.requestId,
      _raw: s._raw || null,
    }
  })

  const dataForTable = mappedRows && mappedRows.length ? mappedRows : [];
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({})

  // Sync active tab to `appliedFilters.status` so tabs actually filter by status
  useEffect(() => {
    const map = {
      pending: 'قيد الإنتظار',
      approved: 'مقبول',
      rejected: 'مرفوض',
    }

    setAppliedFilters((prev) => {
      const next = { ...prev }
      if (activeTab === 'all') {
        // remove status filter
        if (next.status) delete next.status
      } else {
        next.status = map[activeTab] || ''
      }
      return next
    })
  }, [activeTab])

  const filteredData = React.useMemo(() => {
    if (!appliedFilters || Object.keys(appliedFilters).length === 0) return dataForTable
    return applyFilters(dataForTable, appliedFilters)
  }, [dataForTable, appliedFilters])

  const tabs = [
    { value: 'pending', label: 'قيد الانتظار' },
    { value: 'approved', label: 'مقبول' },
    { value: 'rejected', label: 'مرفوض' },
    { value: 'all', label: 'عرض الكل' }
  ];

  // Merge server-provided statusBar items into the static statsConfig
  const combinedStats = React.useMemo(() => {
    const sb = Array.isArray(statusBar) ? statusBar : [];
    const baseMap = new Map(statsConfig.map(item => [item.id, { ...item }]));

    sb.forEach((item, idx) => {
      const id = item.statusKey || item.id || `sb_${idx}`;
      const value = item.statusBarValue ?? item.value ?? item.count ?? 0;
      const note = item.statusBarNote || item.note || '';

      const existing = baseMap.get(id);
      if (existing) {
        existing.value = value;
        const baseNote = existing.note ? String(existing.note).trim() : '';
        const serverNote = note ? String(note).trim() : '';
        existing.note = [serverNote, baseNote].filter(Boolean).join('  ');
      } else {
        baseMap.set(id, {
          id,
          value,
          unit: 'طلب',
          note,
          icon: FaPeopleGroup,
          iconBg: 'bg-go-bg-l-e',
          iconColor: 'text-go-primary-g'
        });
      }
    });

    const ordered = statsConfig.map(i => baseMap.get(i.id));
    const appended = [];
    for (const [k, v] of baseMap.entries()) {
      if (!statsConfig.find(i => i.id === k)) appended.push(v);
    }
    return [...ordered, ...appended];
  }, [statusBar]);

  const selectedStatsIds = combinedStats.map(c => c.id);

  const isLoading = isFetchLoading || loading;

  return <>
    {/* <ContentSkeleton /> */}
    <div className="flex gap-4 items-center flex-col">
      <div className="w-full">
        <DashCardGroup statsConfig={combinedStats} selected={selectedStatsIds} />
      </div>
      <DashboardContentHeader
        title={
          <div className="flex items-center gap-2">
            <span>قائمة طلبات الموردين</span>
            {isLoading && <Spinner />}
          </div>
        }
        // createButtonTitle="إضافة مورد"
        columns={columns}
        visibleColumns={visibleColumns}
        createComponent={typeof SupplierDialog !== 'undefined' ? <SupplierDialog /> : null}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
        onVisibleColumnsChange={setVisibleColumns}
        apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
        apiFilter2={{ title: "تصفية الأعمدة", onClick: () => setFilterSheetOpen(true) }}
        searchPlaceholder="ابحث في الموردين..."
        onSearch={(value) => console.log(value)}
      />
      <DataTable
        columns={columns}
        visibleColumns={visibleColumns}
        data={filteredData}
        isLoading={isLoading}

        rowDialog={typeof SupplierDialog !== 'undefined' ? <SupplierDialog /> : null}
        detailsComponentMap={{ supplier: SuppliersContentNoConditions }}
        pageSizeOptions={[5, 10, 25]}
        initialPageSize={5}
        // totalRows={80} // لو server-side pagination
        onPageChange={(page, size) => console.log('page', page, 'size', size)}
        onSelectionChange={(sel) => console.log('selected', sel)}
        onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
      />
      <UnifiedFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        initial={appliedFilters}
        onApply={(f) => setAppliedFilters(f)}
      />
      <div className="w-full mt-4">
        <div className="text-sm font-medium mb-2">API Response (from Redux):</div>
        <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-xs max-h-80 overflow-auto">{
          loading ? 'Loading...' : (error ? `Error: ${error}` : JSON.stringify({ statusBar, items }, null, 2))
        }</pre>
      </div>
    </div>
  </>
}



export default page