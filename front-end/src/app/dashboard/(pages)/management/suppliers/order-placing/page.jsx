"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSuppliers, selectSupplierById } from '../../../../../../redux/slices/supplierManagementSlice'
import { Avatar } from '@/components/ui/avatar'
import DashboardContentHeader from '@/components/ui/common/dashboard-content-header/dashboard-content-header'
import useSearchPagination from '@/hooks/useSearchPagination'
import DataTable from '@/components/ui/common/dataTable/dataTable'
import UnifiedFilterSheet from '@/components/ui/filters/UnifiedFilterSheet'
import { Badge } from '@/components/ui/badge'
import ProductsContent from '@/components/ui/common/dataTable/contents/products-content'
import Counter from '@/components/ui/common/counter/counter'
import { FaRegTrashCan } from 'react-icons/fa6'


export default function OrderPlacingPage() {
  const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود المنتج', width: 60, render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
    { key: 'productName', title: 'اسم المنتج', width: 180 },
    {
      key: 'avatar', title: 'العلامة التجارية', width: 150, render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar><img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" /></Avatar>
          <div className=" truncate font-honor">{r.name}</div>
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
      key: 'subCategory', title: 'تصنيف فرعي', width: 120, render: (r) => {
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
      key: 'status', title: 'الحالة', width: 100, render: (r) => {
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
    {
      key: 'tax', title: 'القيمة المضافة', width: 100, render: (r) => {
        const raw = String(r.isTax ?? '').trim();
        const lower = raw.toLowerCase();

        // Map common Arabic/English variants to states
        const isTaxTrue = /نعم|yes|true/.test(lower);
        const isTaxFalse = /لا|no|false/.test(lower);

        const base = 'px-3 py-5! text-xs rounded-xl';
        let classes = '';

        if (isTaxTrue) {
          classes = `${base} bg-green-50 text-green-500`;
        } else if (isTaxFalse) {
          classes = `${base} bg-red-50 text-red-600`;
        } else {
          // default / unknown -> pending-style fallback
          classes = `${base} bg-[#FDEDCE] text-go-primary-o`;
        }

        return <span className={classes}>{raw}</span>;
      }
    },
    { key: 'price', title: 'السعر', width: 100, render: (r) => <div>{r.price ? `${r.price} ج.م` : 'N/A'}</div> },
    // {key:"quantity", title:"الكمية", width:120, render: (r)=><div> <span> <strong>
    //   <Counter
    //     value={quantities[r.id]}
    //     min={1}
    //     max={100}
    //     onChange={(v) => updateQuantity(r.id, v)}
    //   /></strong> </span> </div>},
    // { key: 'branch', title: 'الفرع الرئيسى', width: 90, render: (r) => <div>{r.branch}</div> },
    // { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
    // { key: 'accessed-from', title: 'وسيلة الوصول', width: 120, render: (r) => <div>{r.accessedFrom}</div> },
    // { key: 'date', title: 'تاريخ الإنضمام', width: 140 },
    // { key: 'actions', title: 'خيارات', width: 120 },
  ];

  const orderColumns = [
    // { key: 'checkbox', title: '', width: 40 },
    // { key: 'code', title: 'كود المنتج', width: 60, render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
    { key: 'productName', title: 'اسم المنتج', width: 140 },
    {
      key: 'avatar', title: 'العلامة التجارية', width: 120, render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar><img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" /></Avatar>
          <div className=" truncate font-honor">{r.name}</div>
        </div>
      )
    },
    {
      key: 'category', title: 'تصنيف المنتج', width: 110, render: (r) => {
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
    { key: 'price', title: 'السعر', width: 100, render: (r) => <div>{r.price ? `${r.price} ج.م` : 'N/A'}</div> },
    {
      key: "quantity", title: "الكمية", width: 110, render: (r) => <div> <span> <strong>
        <Counter
          value={quantities[r.id]}
          min={1}
          max={100}
          onChange={(v) => updateQuantity(r.id, v)}
        /></strong> </span> </div>
    },
    { key: 'total', title: 'الإجمالى', width: 100, render: (r) => <div>{r.total ? `${r.total} ج.م` : 'N/A'}</div> },
    {
      key:"delete", title:"حذف", width:40, render: (r)=><div> <button className="w-full text-red-400 hover:text-red-600 transition-all duration-300"><FaRegTrashCan /></button> </div>
    }
    // { key: 'branch', title: 'الفرع الرئيسى', width: 90, render: (r) => <div>{r.branch}</div> },
    // { key: 'assigned-to', title: 'مكلٌف إلى', width: 90, render: (r) => <div>{r.assignedTo}</div> },
    // { key: 'accessed-from', title: 'وسيلة الوصول', width: 120, render: (r) => <div>{r.accessedFrom}</div> },
    // { key: 'date', title: 'تاريخ الإنضمام', width: 140 },
    // { key: 'actions', title: 'خيارات', width: 120 },
  ];

  const rows = [
    {
      id: '1', type: 'product', productName: 'شاي أحمد تي - Ahmed Tea ', description: "شاي أحمد تي مزيج فاخر من أوراق الشاي المختارة، بنكهة قوية ورائحة منعشة تمنحك لحظة دفء واستمتاع في كل كوب.", avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات', isTax: true, price: 1000000, image: 'https://ahmadteausa.com/cdn/shop/products/Special_Blend_1g_Right_1.png?v=1645207369', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
        { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
        { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
        { id: 'i3', type: 'image', src: 'https://picsum.photos/800/600?3', title: 'صورة 3' },
        { id: 'i4', type: 'image', src: 'https://picsum.photos/800/600?4', title: 'صورة 4' },
      ]
    },
    {
      id: '2', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', status: 'غير مفعل', subCategory: 'مشروبات', isTax: false, price: 100, address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
        { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
        { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
        { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
        { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
      ]
    },
    {
      id: '3', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات', isTax: true, price: 45500, address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
        { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
        { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
        { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
        { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
      ]
    },
    {
      id: '4', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', status: 'غير مفعل', subCategory: 'مشروبات', isTax: false, price: 12500, address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
        { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
        { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
        { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
        { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
      ]
    },
    {
      id: '5', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات', isTax: true, price: 100, address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
        { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
        { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
        { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
        { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
      ]
    },
    {
      id: '6', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', status: 'مفعل', subCategory: 'مشروبات', isTax: true, price: 100, address: 'العاشر من رمضان', governorate: 'cairo', city: 'nasr', phone: '01010000001', fullName: 'محمد سمير', email: 'supplier1@example.com', activities: ['food products'], branches: ['السادس من أكتوبر', 'الاسماعيلية'], postalCode: '12345', docs: [
        { id: 'i1', type: 'image', src: 'https://picsum.photos/800/600?1', title: 'صورة 1' },
        { id: 'i2', type: 'image', src: 'https://picsum.photos/800/600?2', title: 'صورة 2' },
        { id: 'p1', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'تقرير PDF' },
        { id: 'p2', type: 'pdf', src: 'https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf', title: 'مثال PDF' },
      ]
    },
  ];

  const orderRows = [
    {
      id: '1', type: 'product', productName: 'شاي أحمد تي - Ahmed Tea ', description: "شاي أحمد تي مزيج فاخر من أوراق الشاي المختارة، بنكهة قوية ورائحة منعشة تمنحك لحظة دفء واستمتاع في كل كوب.", avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 500    },
    {
      id: '2', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 300
    },
    {
      id: '3', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 200
    },
    {
      id: '4', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 400
    },
    {
      id: '5', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 600
    },
    {
      id: '6', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 700
    },
    {
      id: '7', type: 'product', productName: 'محمد سمير', avatar: 'https://avatars.githubusercontent.com/u/124599?v=4', name: "أحمد تى", code: 83513, category: 'منتجات غذائية', price: 100, total: 800
    }
  ];

  const searchParams = useSearchParams()
  const [visibleColumns, setVisibleColumns] = useState(columns.map(c => c.key));
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});

  const supplierId = searchParams?.get?.('supplierId')
  const dispatch = useDispatch()
  const supplier = useSelector(selectSupplierById(supplierId))

  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(rows.map(r => [r.id, 1]))
  );
  const updateQuantity = async (rowId, newValue) => {
    // simulate API call
    await new Promise(res => setTimeout(res, 200));

    setQuantities(prev => ({
      ...prev,
      [rowId]: newValue,
    }));
  };


  useEffect(() => {
    if (!supplier && supplierId) {
      dispatch(fetchSuppliers())
    }
  }, [supplierId, supplier, dispatch])

  const supplierData = {
    id: supplierId,
    companyName: supplier?.companyName || 'N/A',
    fullName: supplier?.fullName || 'N/A',
    email: supplier?.email || 'N/A',
    phone: supplier?.companyNumber || 'N/A',
    address: supplier?.address || 'N/A',
    joinDate: supplier?.joinDate || 'N/A',
    categories: supplier?.categories || 'N/A',
    maximumInvoiceAmount: supplier?.maximumInvoiceAmount || 'N/A',
    maximumProcessingDays: supplier?.maximumProcessingDays || 'N/A',
    minimumInvoiceAmount: supplier?.minimumInvoiceAmount || 'N/A',
    minimumItemInInvoice: supplier?.minimumItemInInvoice || 'N/A',
    hasElectronicInvoice: supplier?.hasElectronicInvoice || false,
    hasDeliveryService: supplier?.hasDeliveryService || false,
    code: supplier?.code || 'N/A',
  }

  const fuseOptions = { keys: ["code", "productName", "name"], threshold: 0.35 };

  const {
    data: pagedData,
    searchedData,
    total,
    page: currentPage,
    limit,
    setSearch,
    setPage,
    setLimit,
  } = useSearchPagination({
    queryKey: 'products-search',
    isOnline: false,
    initialLimit: 5,
    data: rows,
    fuseOptions
  });




  return (
    <>
      <header className="">
        <div className="supplier-header flex gap-5 justify-between p-6 bg-white rounded-lg">

          <div className="info flex gap-4 w-1/2">
            <div className="image">
              {/* optional supplier image */}
              <Avatar className="w-16 h-16">
                <img
                  src='https://avatars.githubusercontent.com/u/124599?v=4'
                  alt="Supplier Image"
                />
              </Avatar>
            </div>
            <div className="details">
              <h1 className="company-name font-bold text-xl">{supplierData.companyName}</h1>
              <h2 className='text-sm text-gray-500'>كود المورد : <span className='text-black'>{supplierData.code}</span></h2>
              <h2 className='text-sm text-gray-500'>رقم الكيان : <span className='text-black'>{supplierData.phone}</span></h2>
              <p className='text-sm text-gray-500 mt-2'>
                صفحه معلومات المورد لعملية وضع الطلبات. تعرض هذه الصفحة تفاصيل المورد مثل اسم الشركة، الاسم الكامل، البريد الإلكتروني، رقم الهاتف، العنوان، تاريخ الانضمام، الفئات التي ينتمي إليها المورد، وشروط المورد مثل الحد الأدنى والأقصى لقيمة الفاتورة، الحد الأقصى لأيام المعالجة، وتوفر الفاتورة الإلكترونية وخدمة التوصيل.
              </p>
            </div>
          </div>
          <div className="terms shadow-md px-4 py-3 w-1/2 rounded-lg bg-white">
            <h2 className='font-bold text-xl pb-3'>شروط المورد</h2>
            <div className="info flex justify-around gap-4">
              <div className="right flex flex-col gap-2">
                <p className='text-sm font-semibold'>الحد الأدنى لعدد الأصناف في الفاتورة : {supplierData.minimumItemInInvoice} منتج</p>
                <p className='text-sm font-semibold'>الحد الأدنى لقيمة الفاتورة : {supplierData.minimumInvoiceAmount} جنيه</p>
                <p className='text-sm font-semibold'>الحد الأقصى لقيمة الفاتورة : {supplierData.maximumInvoiceAmount} جنيه</p>
              </div>
              <div className="border border-gray-300"></div>
              <div className="left flex flex-col gap-2">
                <p className='text-sm font-semibold'>الحد الأقصى لأيام المعالجة : {supplierData.maximumProcessingDays} يوم</p>
                <p className='text-sm font-semibold'>الفاتورة الإلكترونية : {supplierData.hasElectronicInvoice ? 'متوفر' : 'غير متوفر'}</p>
                <p className='text-sm font-semibold'>خدمة التوصيل : {supplierData.hasDeliveryService ? 'متوفر' : 'غير متوفر'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="supplier's-products flex flex-col gap-4">
        <DashboardContentHeader
          title={
            <div className="flex items-center gap-2">
              <span>منتجات المورد</span>
              {/* {isLoading && <Spinner />} */}
            </div>
          }

          columns={columns}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
          apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
          apiFilter2={{ title: "تصفية", onClick: () => setFilterSheetOpen(true) }}
          searchPlaceholder="ابحث في الموردين..."
          onSearch={(value) => setSearch(value)}
        />

        <DataTable
          // isLoading={isLoading}
          columns={columns}
          visibleColumns={visibleColumns}
          data={searchedData}
          detailsComponentMap={{ product: ProductsContent }}

          pageSizeOptions={[5, 10, 25]}
          initialPageSize={limit}
          totalRows={searchedData?.length || 0}
          onPageChange={(p, s) => { setPage(p); setLimit(s); }}
          onSelectionChange={(sel) => console.log('selected', sel)}
          onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
        />

        <h1 className="text-xl font-semibold mt-5">تأكيد تفاصيل الطلب</h1>
        <div className="flex gap-4 items-start">
          <div className="w-3/4">
            <DataTable
              // isLoading={isLoading}
              showCheckboxes={false}
              showDragHandles={false}
              columns={orderColumns}
              data={orderRows}
              disableAccordion={true}
              onSelectionChange={(sel) => console.log('selected', sel)}
              onOrderChange={(newRows) => console.log('new order', newRows.map(r => r.id))}
            />
          </div>
          <div className="w-1/4 max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-center text-lg font-semibold text-gray-800">
              ملخص الطلب
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>إجمالي المبلغ</span>
                <span>5,000 جنيه</span>
              </div>

              <div className="flex justify-between">
                <span>إجمالي عدد الأصناف</span>
                <span>4</span>
              </div>

              <div className="flex justify-between">
                <span>قيمة العمولة (%4)</span>
                <span>500 جنيه</span>
              </div>

              <div className="flex justify-between">
                <span>قيمة الشحن</span>
                <span>500 جنيه</span>
              </div>

              <div className="flex justify-between">
                <span>القيمة المضافة (%14)</span>
                <span>0 جنيه</span>
              </div>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-semibold text-gray-900">
              <span>المبلغ الإجمالي</span>
              <span>6,000 جنيه</span>
            </div>

            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-lg bg-teal-500 py-2 text-sm font-medium text-white hover:bg-teal-600 transition">
                تأكيد الأوردر
              </button>

              <button className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition">
                إلغاء
              </button>
            </div>
          </div>
        </div>

        <UnifiedFilterSheet
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          initial={filters}
          onApply={setFilters}
          showCategories={true}
          showDate={false}
          showStatus={true}
        />

      </div>
    </>
  )
}