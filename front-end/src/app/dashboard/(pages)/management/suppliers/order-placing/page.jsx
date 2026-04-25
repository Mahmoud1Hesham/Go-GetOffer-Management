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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, ChevronDown, ListFilter } from 'lucide-react'


export default function OrderPlacingPage() {
  const columns = [
    { key: 'checkbox', title: '', width: 40 },
    { key: 'code', title: 'كود المنتج', width: 60, render: (r) => <div className="truncate w-full text-right" dir="ltr" title={r.code}>{r.code}</div> },
    { key: 'productName', title: 'اسم المنتج', width: 180 },
    {
      key: 'tax', title: 'القيمة المضافة', width: 100, render: (r) => {
        const raw = String(r.isTax ?? '').trim();
        const lower = raw.toLowerCase();
        const isTaxTrue = /نعم|yes|true/.test(lower);
        
        return <Badge variant="outline" className="px-2 py-1 text-xs bg-gray-50 text-gray-600 border-gray-200">{isTaxTrue ? 'نعم' : 'لا'}</Badge>;
      }
    },
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
      key: "quantity", title: "الكمية", width: 120, render: (r) => <div> <span> <strong>
        <Counter
          value={quantities[r.id]}
          min={1}
          max={100}
          onChange={(v) => updateQuantity(r.id, v)}
        /></strong> </span> </div>
    },
    { key: 'price', title: 'السعر', width: 100, render: (r) => <div>{r.price ? `${r.price} ج.م` : 'N/A'}</div> },
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
      <div className="flex flex-col gap-2 p-4" dir="rtl">
        {/* Title area as shown top right */}
        <div className="flex  p-4 rounded-xl">
          <h1 className="text-3xl font-bold text-[#144f5c]">{supplierData.companyName}</h1>
        </div>

        <Tabs defaultValue="supplier-details" className="w-full bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex justify-end border-b border-gray-100 bg-white px-6">
            <TabsList className="bg-transparent border-0 flex gap-10 h-auto p-0">
              <TabsTrigger 
                value="order-details" 
                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#20c9a6] data-[state=active]:text-[#20c9a6] text-gray-500 data-[state=active]:bg-transparent py-4 px-1 font-bold text-lg flex items-center gap-2 transition-none shadow-none data-[state=active]:shadow-none"
              >
                <div className="flex items-center gap-3 w-full justify-end">
                  <Badge className="bg-[#20c9a6] hover:bg-[#1db897] text-white rounded-full px-2 py-0.5 text-sm">{orderRows.length}</Badge>
                  <span>تفاصيل الطلب</span>
                </div>
              </TabsTrigger>
              
              <TabsTrigger 
                value="supplier-details" 
                className="rounded-none border-b-[3px] border-transparent data-[state=active]:border-[#20c9a6] data-[state=active]:text-[#20c9a6] text-gray-500 data-[state=active]:bg-transparent py-4 px-1 font-bold text-lg transition-none shadow-none data-[state=active]:shadow-none"
              >
                تفاصيل المورد
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="supplier-details" className="bg-white p-8 outline-none mt-0 rounded-b-xl" dir="rtl">
            <div className="flex flex-col gap-8">
              {/* Top Info */}
              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-start items-center w-full gap-4">
                  <h2 className="text-xl font-bold text-[#144f5c]">
                    {supplierData.code} / {supplierData.companyName}
                  </h2>
                  <div className="flex gap-3">
                    {supplierData.hasElectronicInvoice ? (
                      <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
                        (توجد فاتورة الكترونية)
                      </span>
                    ) : <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
                        (لا توجد فاتورة الكترونية)
                      </span>}
                    {supplierData.hasDeliveryService ? (
                      <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
                        (توجد خدمة توصيل)
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium">
                        (لا توجد خدمة توصيل)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-gray-600 text-base font-medium">
                  <p>رقم الهاتف: {supplierData.phone} - البريد الالكتروني: {supplierData.email}</p>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-2">
                <h3 className="text-xl font-bold text-[#144f5c] mb-4">الانشطة / الفئة الرئيسية</h3>
                <div className="flex flex-wrap gap-x-12 gap-y-4">
                  {Array.isArray(supplierData.categories) && supplierData.categories.length > 0 ? (
                    supplierData.categories.map((cat, idx) => {
                      const name = typeof cat === 'object' ? (cat.name || cat.nameAr || 'غير محدد') : cat;
                      const subCount = typeof cat === 'object' && Array.isArray(cat.subCategories) ? cat.subCategories.length : 0;
                      return (
                        <p key={idx} className="text-gray-600 text-base font-medium">
                          {name}: <span className="font-bold text-[#144f5c]">{subCount}</span> فئات فرعية
                        </p>
                      );
                    })
                  ) : (typeof supplierData.categories === 'string' && supplierData.categories !== 'N/A') ? (
                    <p className="text-gray-600 text-base font-medium">{supplierData.categories}</p>
                  ) : (
                    <p className="text-gray-500 text-base italic">لا توجد أنشطة مسجلة</p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="mt-2 mb-4">
                <h3 className="text-xl font-bold text-[#144f5c] mb-4">شروط المورد</h3>
                <div className="flex justify-start gap-32">
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 text-base font-medium">الحد الأدنى لعدد الأصناف في الفاتورة: <span className="font-bold text-gray-900">{supplierData.minimumItemInInvoice}</span> منتج</p>
                    <p className="text-gray-600 text-base font-medium">الحد الأدنى لقيمة الفاتورة: <span className="font-bold text-gray-900">{supplierData.minimumInvoiceAmount}</span> جنيه</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <p className="text-gray-600 text-base font-medium">الحد الأقصى لأيام المعالجة: <span className="font-bold text-gray-900">{supplierData.maximumProcessingDays}</span> يوم</p>
                    <p className="text-gray-600 text-base font-medium">الحد الأقصى لقيمة الفاتورة: <span className="font-bold text-gray-900">{supplierData.maximumInvoiceAmount}</span> جنيه</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="order-details" className="bg-transparent outline-none mt-0">
            <div className="flex flex-col lg:flex-row-reverse gap-4 w-full items-start px-6 py-3">
              
              {/* Order Cart Table - Right side as shown in screenshot (First in RTL DOM structure) */}
              <div className="w-full lg:w-2/3 xl:w-3/4 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" dir="rtl">
                <div className="flex flex-row-reverse justify-between items-center px-6 py-8 border-b border-gray-50">
                  <div className="flex flex-row-reverse gap-2 relative">
                    <button className="border border-gray-200 px-5 py-2.5 text-sm font-bold rounded-lg text-gray-700 flex items-center gap-2 hover:bg-gray-50 transition-colors">
                      <ListFilter className="w-4 h-4 text-gray-500" /> تصفية حسب
                    </button>
                    <button className="border border-gray-200 px-5 py-2.5 text-sm font-bold rounded-lg text-gray-700 flex items-center gap-2 flex-row hover:bg-gray-50 transition-colors">
                      حدد خيار <ChevronDown className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="relative flex justify-end">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="ابحث هنا" 
                      className="pl-4 pr-12 py-2.5 border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:border-[#20c9a6] focus:ring-1 focus:ring-[#20c9a6] text-right placeholder:text-gray-400 font-medium transition-colors"
                      dir="rtl"
                    />
                  </div>
                </div>
                <div className="p-2" dir="rtl">
                  <DataTable
                    showCheckboxes={true}
                    showDragHandles={false}
                    columns={orderColumns}
                    data={orderRows}
                    disableAccordion={true}
                  />
                </div>
              </div>

              {/* Order summary - Left side as shown in screenshot (Second in RTL DOM structure) */}
              <div className="w-full lg:w-1/3 xl:w-1/4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-6 text-right text-xl font-bold text-gray-900">
                  ملخص الطلب
                </h3>

                <div className="space-y-5 text-sm text-gray-800 font-bold">
                  <div className="flex justify-between flex-row-reverse">
                    <span>إجمالي المبلغ</span>
                    <span className="text-[#144f5c]">4750 جنيه</span>
                  </div>

                  <div className="flex justify-between flex-row-reverse">
                    <span>إجمالي عدد الأصناف</span>
                    <span className="text-[#144f5c]">5</span>
                  </div>

                  <div className="flex justify-between flex-row-reverse">
                    <span>قيمة العمولة (%4)</span>
                    <span className="text-[#144f5c]">200 جنيه</span>
                  </div>

                  <div className="flex justify-between flex-row-reverse">
                    <span className="line-through text-gray-400">قيمة الشحن</span>
                    <span className="line-through text-gray-400">100 جنيه</span>
                  </div>

                  <div className="flex justify-between flex-row-reverse">
                    <span>القيمة المضافة</span>
                    <span className="text-[#144f5c]">0 جنيه</span>
                  </div>
                </div>

                <hr className="my-6 border-gray-200" />

                <div className="flex justify-between flex-row-reverse font-bold text-lg text-gray-900">
                  <span className="text-sm">المبلغ الإجمالي</span>
                  <span className="text-[#144f5c]">5050 <span className="text-sm">جنيه</span></span>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                  <button className="w-full rounded-lg bg-[#20c9a6] py-3.5 text-base font-bold text-white hover:bg-[#1db897] transition-colors shadow-sm">
                    تأكيد الطلب
                  </button>

                  <button className="w-full rounded-lg border border-gray-200 bg-white py-3.5 text-base font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    إلغاء الطلب
                  </button>
                </div>
              </div>
              
            </div>
          </TabsContent>
        </Tabs>

        {/* Supplier Products Table - Extracted OUTSIDE the tabs */}
        <div className="w-full bg-white rounded-xl shadow-sm outline-none mt-4 px-8 py-6">
          <div className="mb-6 flex flex-col pt-2 border-gray-100">
            <DashboardContentHeader
              title={<span className="text-2xl font-bold text-[#144f5c]">منتجات المورد</span>}
              columns={columns}
              visibleColumns={visibleColumns}
              onVisibleColumnsChange={setVisibleColumns}
              apiFilter1={{ title: "تخصيص الأعمدة", onClick: () => console.log("filter 1") }}
              apiFilter2={{ title: "تصفية", onClick: () => setFilterSheetOpen(true) }}
              searchPlaceholder="ابحث في المنتجات..."
              onSearch={setSearch}
            />
          </div>
          <div dir="rtl">
            <DataTable
              columns={columns}
              visibleColumns={visibleColumns}
              data={searchedData}
              detailsComponentMap={{ product: ProductsContent }}
              pageSizeOptions={[5, 10, 25]}
              initialPageSize={limit}
              totalRows={searchedData?.length || 0}
              onPageChange={(p, s) => { setPage(p); setLimit(s); }}
            />
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