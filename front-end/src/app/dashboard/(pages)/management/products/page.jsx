"use client";
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ContentSkeleton from '@/components/ui/common/content-skeleton/content-skeleton.jsx'
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header';
import DashCardGroup from '@/components/ui/common/dashCard/dashCardGroup';
import ProductsContent from '@/components/ui/common/dataTable/contents/products-content';
import SuppliersContent from '@/components/ui/common/dataTable/contents/suppliers-content';
import DataTable from '@/components/ui/common/dataTable/dataTable';
import SupplierDialog from '@/components/ui/common/dialogs/supplierDialog';
import React, { useState } from 'react'
import { LuAward, LuPackageCheck, LuPackageX } from 'react-icons/lu';
import { TbPackages } from 'react-icons/tb';

const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود المنتج', width: 80 },
    { key: 'productName', title: 'اسم المنتج', width: 120 },
    {
        key: 'avatar', title: 'العلامة التجارية', width: 180, render: (r) => (
            <div className="flex items-center gap-2">
                <Avatar><img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" /></Avatar>
                <div className="text-sm truncate">{r.name}</div>
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


const rows = [
    {
        id: '1', type: 'product', productName: 'شاي أحمد تي - Ahmed Tea ',description:"شاي أحمد تي مزيج فاخر من أوراق الشاي المختارة، بنكهة قوية ورائحة منعشة تمنحك لحظة دفء واستمتاع في كل كوب.", avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات', image:'https://ahmadteausa.com/cdn/shop/products/Special_Blend_1g_Right_1.png?v=1645207369', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'i3', type: 'image', src: 'https://picsum.photos/800/600?3', title: 'صورة 3' },
            { id: 'i4', type: 'image', src: 'https://picsum.photos/800/600?4', title: 'صورة 4' },
        ]
    },
    {
        id: '2', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'غير مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
        ]
    },
    {
        id: '3', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
        ]
    },
    {
        id: '4', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'غير مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
        ]
    },
    {
        id: '5', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
        ]
    },
    {
        id: '6', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4',name:"أحمد تى", code: 83513,  category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات',  address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
            { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
            { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
            { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
            { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
        ]
    },
];
const statsConfig = [
    {
        id: "total_products",
        title: "إجمالي المنتجات",
        value: 100,
        unit: "منتج",
        note: "+52 منتج جديد هذا الشهر",
        icon: TbPackages,
        iconBg: "bg-go-bg-l-e",
        iconColor: "text-go-primary-g"
    },
    {
        id: "avalible_products",
        title: "الموردون المعتمدون",
        value: 40,
        unit: "منتج",
        note: "78% من إجمالي المنتجات",
        icon: LuPackageCheck,
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
    },
    {
        id: "halted_products",
        title: "المنتجات الموقوفة",
        value: 8,
        unit: "منتج",
        note: "خلال آخر 30 يوم",
        icon: LuPackageX,
        iconBg: "bg-red-100",
        iconColor: "text-go-primary-cancel"
    },
    {
        id: "top_seller_products",
        title: "أفضل المنتجات مبيعاً",
        value: null,
        unit: "شاى العروسه",
        note: "+2K عملية بيع هذا الشهر",
        icon: LuAward,
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
    },
];


const page = () => {

    const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));

    return <>

        {/* <ContentSkeleton /> */}
        <div className="flex gap-4 items-center flex-col">
            <div className="w-full">
                <DashCardGroup statsConfig={statsConfig} />
            </div>
            <DashboardContentHeader
                title="إدارة المنتجات"
                createButtonTitle="إضافة منتج"
                createComponent={<SupplierDialog />}
                columns={columns}
                visibleColumns={visibleColumns}
                onVisibleColumnsChange={setVisibleColumns}
                apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
                apiFilter2={{ title: "تصفية الأعمدة", onClick: () => console.log("filter 2") }}
                searchPlaceholder="ابحث في المنتجات..."
                onSearch={(value) => console.log(value)}
            />
            <DataTable
                columns={columns}
                visibleColumns={visibleColumns}
                data={rows}
                detailsComponentMap={{ product: ProductsContent }}
                rowDialog={<SupplierDialog />}

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