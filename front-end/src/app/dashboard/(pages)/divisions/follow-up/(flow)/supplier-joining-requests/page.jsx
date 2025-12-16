"use client";
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DashCardGroup from '@/components/ui/common/dashCard/dashCardGroup';
import SuppliersContent from '@/components/ui/common/dataTable/contents/suppliers-content';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import React, { useState } from 'react'
import { PiClockUser, PiUserMinusLight, PiUserPlus, PiUserSwitch } from 'react-icons/pi';

const columns = [
  { key: 'checkbox', title: '', width: 40 },
  { key: 'code', title: 'كود المورد', width: 80 },
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
  { key: 'branch', title: 'الفرع الرئيسى', width: 120, render: (r) => <div>{r.branch}</div> },
  // { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
  { key: 'accessed-from', title: 'وسيلة الوصول', width: 180, render: (r) => <div>{r.accessedFrom}</div> },
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


const rows = [
  {
    id: '1', type: 'supplier', name: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 83513, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'المعادى', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '2', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', accessedFrom: 'مندوب', address: "السادس من أكتوبر", governorate: 'giza', city: 'haram', phone: '01010000002', fullName: 'أحمد علي', email: 'supplier2@example.com', activities: ['food products'], branches: ['السويس'], postalCode: '67890', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '3', type: 'supplier', name: 'أحمد علي عوضين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه', 'ادوات تنظيف'], status: 'مقبول', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'maadi', phone: '01010000003', fullName: 'أحمد علي عوضين', email: 'supplier3@example.com', activities: ['food products', 'office supplies', 'buffet', 'cleaning supplies'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '4', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'nasr', phone: '01010000004', fullName: 'أحمد علي', email: 'supplier4@example.com', activities: ['food products'], branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '33445', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '5', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'معادى', governorate: 'cairo', city: 'maadi', phone: '01010000005', fullName: 'أحمد علي', email: 'supplier5@example.com', activities: ['food products'], branches: ['المعادى', 'القاهرة الجديدة'], postalCode: '55667', rejectionReasons: ['missing_docs', 'expired_docs'], docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '6', type: 'supplier', name: 'أحمد علي حسنين', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', accessedFrom: 'مندوب', address: 'القاهرة الجديدة', governorate: 'cairo', city: 'nasr', phone: '01010000006', fullName: 'أحمد علي حسنين', email: 'supplier6@example.com', activities: ['food products'], branches: ['القاهرة الجديدة', 'المعادى'], postalCode: '77889', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '7', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مقبول', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'الدقي', governorate: 'giza', city: 'giza-city', phone: '01010000007', fullName: 'أحمد علي', email: 'supplier7@example.com', activities: ['food products'], branches: ['الدقي', 'الجيزه'], postalCode: '99000', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '8', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'تعبئه وتغليف'], status: 'مرفوض', branch: 'جيزة', accessedFrom: 'مندوب', address: 'فيصل', governorate: 'alex', city: 'sidi', phone: '01010000008', fullName: 'أحمد علي', email: 'supplier8@example.com', activities: ['food products', 'packaging materials'], branches: ['فيصل', 'الجيزة'], postalCode: '10101', rejectionReasons: ['mismatch'], docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '9', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'بوفيه'], status: 'قيد الانتظار', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'nasr', phone: '01010000009', fullName: 'أحمد علي', email: 'supplier9@example.com', activities: ['food products', 'buffet'], branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '10', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: ['منتجات غذائية', 'ادوات مكتبية', 'بوفيه'], status: 'مرفوض', branch: 'جيزة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'maadi', phone: '01010000010', fullName: 'أحمد علي', email: 'supplier10@example.com', activities: ['food products', 'office supplies', 'buffet'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['does_not_match_the_requirements', 'repeated_request'], docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '11', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'قيد الانتظار', branch: 'جيزة', accessedFrom: 'وسائل التواصل الاجتماعي', address: 'هيليوبوليس', governorate: 'cairo', city: 'nasr', phone: '01010000011', fullName: 'أحمد علي', email: 'supplier11@example.com', activities: ['food products'], branches: ['هيليوبوليس', 'القاهرة'], postalCode: '11223', docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
  {
    id: '12', type: 'supplier', name: 'أحمد علي', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', code: 44607, date: '25 نوفمبر 2025', category: 'منتجات غذائية', status: 'مرفوض', branch: 'جيزة', accessedFrom: 'مندوب', address: 'مدينة نصر', governorate: 'cairo', city: 'nasr', phone: '01010000012', fullName: 'أحمد علي', email: 'supplier12@example.com', activities: ['food products'], branches: ['مدينة نصر', 'المعادى'], postalCode: '11223', rejectionReasons: ['incomplete'], docs: [
      { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
      { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
      { id: 'p1', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'تقرير PDF' },
      { id: 'p2', type: 'pdf', src: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', title: 'مثال PDF' },
    ]
  },
];
const statsConfig = [
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
  {
    id: "resubmitted_requests",
    title: "طلبات معاد تقديمها",
    value: 12,
    unit: "طلب",
    note: "الطلبات التي تم إرسالها مرة أخرى للتصحيح أو الاستكمال",
    icon: PiUserSwitch,
    iconBg: "bg-go-bg-l-e",
    iconColor: "text-go-primary-g"
  },
];

const page = () => {
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [activeTab, setActiveTab] = useState('pending');
  const tabs = [
    { value: 'pending', label: 'قيد الانتظار', count: 6 },
    { value: 'approved', label: 'مقبول', count: 2 },
    { value: 'rejected', label: 'مرفوض', count: 4 },
    { value: 'all', label: 'عرض الكل' }
  ];

  return <>
    {/* <ContentSkeleton /> */}
    <div className="flex gap-4 items-center flex-col">
      <div className="w-full">
        <DashCardGroup statsConfig={statsConfig} />
      </div>
      <DashboardContentHeader
        title="قائمة طلبات الموردين"
        // createButtonTitle="إضافة مورد"
        columns={columns}
        visibleColumns={visibleColumns}
        createComponent={typeof SupplierDialog !== 'undefined' ? <SupplierDialog /> : null}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onVisibleColumnsChange={setVisibleColumns}
        apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
        apiFilter2={{ title: "تصفية الأعمدة", onClick: () => console.log("filter 2") }}
        searchPlaceholder="ابحث في الموردين..."
        onSearch={(value) => console.log(value)}
      />
      <DataTable
        columns={columns}
        visibleColumns={visibleColumns}
        data={rows}
        rowDialog={typeof SupplierDialog !== 'undefined' ? <SupplierDialog /> : null}
        detailsComponentMap={{ supplier: SuppliersContent }}
        pageSizeOptions={[5, 10, 25]}
        initialPageSize={5}
        // totalRows={80} // لو server-side pagination
        onPageChange={(page, size) => console.log('page', page, 'size', size)}
        onSelectionChange={(sel) => console.log('selected', sel)}
        onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
      />
    </div>
  </>
}

export default page