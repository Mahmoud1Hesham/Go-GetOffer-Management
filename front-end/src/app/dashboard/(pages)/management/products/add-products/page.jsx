"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuChevronRight, LuFileUp } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LuTrash2, LuPlus, LuImage, LuSave } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQueryFetch, useMutationFetch } from '@/hooks/useQueryFetch';
import { activities } from '@/utils/interfaces/activities';
import { units } from '@/utils/interfaces/units';
import { Combobox } from '@/components/ui/common/combo-box/comboBox';
import useForm from '@/hooks/useForm';
import { useValidationI18nSchemas } from '@/hooks/useTranslatedValidation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileUploader from '@/components/ui/common/file-uploader/fileUploader';



const AddProductPage = () => {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState('product');
    const [activeTab, setActiveTab] = useState('single');
    const { schemas, i18n } = useValidationI18nSchemas();
    const lang = i18n.language;

    // Bulk Upload State
    const [bulkValues, setBulkValues] = useState({
        category: '',
        subCategory: '',
        brand: '',
        file: null
    });
    const [bulkErrors, setBulkErrors] = useState({});
    const [bulkResponse, setBulkResponse] = useState(null);
    const [fileUploaderKey, setFileUploaderKey] = useState(0);


    const arActivities = activities.find(a => a.ar)?.ar || [];

    // 1. Fetch Categories
    const { data: categoriesData } = useQueryFetch(['categories'], '/api/category');

    // 2. Process Categories to match with activities (icons)
    const processedCategories = React.useMemo(() => {
        if (!categoriesData?.data) return [];
        return categoriesData.data.map(cat => {
            // Match categoryKey from API with value in activities
            const activity = arActivities.find(a => a.value === (cat.categorykey || cat.categoryKey));
            console.log(activity)
            return {
                ...cat,
                icon: activity?.icon,
                // Use API name, fallback to activity label
                displayName: cat.name || activity?.label
            };
        });
    }, [categoriesData, arActivities]);

    const categoryOptions = React.useMemo(() => {
        return processedCategories.map(cat => ({
            value: cat.id,
            label: cat.displayName
        }));
    }, [processedCategories]);

    const { mutate: createProduct, isPending: isCreating } = useMutationFetch({
        url: '/api/product/create',
        options: { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                toast.success("تم إضافة المنتج بنجاح");
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة المنتج");
            }
        }
    });

    const onSubmit = (values) => {
        console.log("Submitting values:", values);
        const formData = new FormData();
        formData.append('BrandId', values.brand);
        formData.append('IsTax', values.hasVat);

        // Product Translations
        formData.append('ProductTranslationDTOs[0].Name', values.nameEn);
        formData.append('ProductTranslationDTOs[0].LanguageCode', 'en-US');
        formData.append('ProductTranslationDTOs[1].Name', values.nameAr);
        formData.append('ProductTranslationDTOs[1].LanguageCode', 'ar-EG');

        // Variants
        values.variants.forEach((variant, index) => {
            if (variant.image?.file) {
                formData.append(`ProductVariantDTOs[${index}].Img`, variant.image.file);
            }
            formData.append(`ProductVariantDTOs[${index}].IsMainImg`, variant.isMain);

            // Dictionary lookup for unit labels
            const unitObj = units.find(u => u.value === variant.unit);
            const unitEn = unitObj ? unitObj.labelEn : variant.unit;
            const unitAr = unitObj ? unitObj.labelAr : variant.unit;

            // Variant Translations - AR
            formData.append(`ProductVariantDTOs[${index}].ProductVariantTranslationDTOs[0].LanguageCode`, 'ar-EG');
            formData.append(`ProductVariantDTOs[${index}].ProductVariantTranslationDTOs[0].Description`, variant.descAr);
            formData.append(`ProductVariantDTOs[${index}].ProductVariantTranslationDTOs[0].WeightDisplay`, `${variant.weight} ${unitAr}`);

            // Variant Translations - EN
            formData.append(`ProductVariantDTOs[${index}].ProductVariantTranslationDTOs[1].LanguageCode`, 'en-US');
            formData.append(`ProductVariantDTOs[${index}].ProductVariantTranslationDTOs[1].Description`, variant.descEn);
            formData.append(`ProductVariantDTOs[${index}].ProductVariantTranslationDTOs[1].WeightDisplay`, `${variant.weight} ${unitEn}`);
        });

        // Log FormData entries for debugging
        console.log("FormData Entries:");
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1]);
        }

        createProduct(formData);
    };

    const initialValues = {
        category: '',
        subCategory: '',
        brand: '',
        nameAr: '',
        nameEn: '',
        description: '',
        hasVat: false,
        variants: [
            { id: 1, weight: '', unit: 'ml', descAr: '', descEn: '', image: null, isMain: true }
        ]
    };

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setErrors, setTouched } = useForm(
        initialValues,
        schemas.productSchema,
        onSubmit
    );

    // 3. Fetch SubCategories based on selected Category ID
    const subCategoryFetchOptions = React.useMemo(() => ({
        method: 'POST',
        data: { Id: values.category }
    }), [values.category]);

    const { data: subCategoriesData } = useQueryFetch(
        ['subCategories', values.category, subCategoryFetchOptions],
        '/api/subcategory/Category',
        subCategoryFetchOptions,
        { enabled: !!values.category }
    );

    // 4. Fetch Brands based on selected SubCategory ID
    const brandFetchOptions = React.useMemo(() => ({
        method: 'POST',
        data: { Id: values.subCategory }
    }), [values.subCategory]);

    const { data: brandsData } = useQueryFetch(
        ['brands', values.subCategory, brandFetchOptions],
        '/api/brand/subcategory',
        brandFetchOptions,
        { enabled: !!values.subCategory }
    );

    const subCategories = React.useMemo(() => subCategoriesData?.data || [], [subCategoriesData]);
    const brands = React.useMemo(() => brandsData?.data || [], [brandsData]);

    // --- Bulk Upload Logic ---
    // Bulk SubCategories
    const bulkSubCategoryFetchOptions = React.useMemo(() => ({
        method: 'POST',
        data: { Id: bulkValues.category }
    }), [bulkValues.category]);

    const { data: bulkSubCategoriesData } = useQueryFetch(
        ['subCategories', bulkValues.category, bulkSubCategoryFetchOptions],
        '/api/subcategory/Category',
        bulkSubCategoryFetchOptions,
        { enabled: !!bulkValues.category }
    );

    // Bulk Brands
    const bulkBrandFetchOptions = React.useMemo(() => ({
        method: 'POST',
        data: { Id: bulkValues.subCategory }
    }), [bulkValues.subCategory]);

    const { data: bulkBrandsData } = useQueryFetch(
        ['brands', bulkValues.subCategory, bulkBrandFetchOptions],
        '/api/brand/subcategory',
        bulkBrandFetchOptions,
        { enabled: !!bulkValues.subCategory }
    );

    const bulkSubCategories = React.useMemo(() => bulkSubCategoriesData?.data || [], [bulkSubCategoriesData]);
    const bulkBrands = React.useMemo(() => bulkBrandsData?.data || [], [bulkBrandsData]);

    const bulkSubCategoryOptions = React.useMemo(() => {
        return bulkSubCategories.map(sub => ({
            value: sub.id,
            label: sub.nameAr || sub.name
        }));
    }, [bulkSubCategories]);

    const bulkBrandOptions = React.useMemo(() => {
        return bulkBrands.map(brand => ({
            value: brand.id,
            label: brand.nameAr || brand.name
        }));
    }, [bulkBrands]);

    const { mutate: bulkUpload, isPending: isBulkUploading, } = useMutationFetch({
        url: '/api/Product/bulk',
        options: { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: (data) => {
                toast.success("تم رفع المنتجات بنجاح");
                setBulkResponse(data);
                setFileUploaderKey(prev => prev + 1); 
                // router.push('/dashboard/management/products');
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "حدث خطأ أثناء رفع الملف");
            }
        }
    });

    const onBulkSubmit = () => {
        const errors = {};
        if (!bulkValues.category) errors.category = "مطلوب";
        if (!bulkValues.subCategory) errors.subCategory = "مطلوب";
        if (!bulkValues.brand) errors.brand = "مطلوب";
        if (!bulkValues.file) errors.file = "مطلوب";

        setBulkErrors(errors);
        if (Object.keys(errors).length > 0) return;

        const formData = new FormData();
        // formData.append('CategoryId', bulkValues.category);
        // formData.append('SubCategoryId', bulkValues.subCategory);
        formData.append('BrandId', bulkValues.brand);
        formData.append('File', bulkValues.file);

        bulkUpload(formData);
    };
    // -------------------------


    // Variant Handlers
    const addVariant = () => {
        const newId = values.variants.length > 0 ? Math.max(...values.variants.map(v => v.id)) + 1 : 1;
        setValues(prev => ({
            ...prev,
            variants: [...prev.variants, {
                id: newId,
                weight: '',
                unit: 'ml',
                descAr: '',
                descEn: '',
                image: null,
                isMain: values.variants.length === 0
            }]
        }));
    };

    const removeVariant = (id) => {
        if (values.variants.length === 1) {
            toast.error("يجب أن يحتوي المنتج على وزن واحد على الأقل");
            return;
        }
        const newVariants = values.variants.filter(v => v.id !== id);
        // If we removed the main variant, make the first one main
        if (values.variants.find(v => v.id === id)?.isMain && newVariants.length > 0) {
            newVariants[0].isMain = true;
        }
        setValues(prev => ({ ...prev, variants: newVariants }));
    };

    const updateVariant = (id, field, value) => {
        setValues(prev => ({
            ...prev,
            variants: prev.variants.map(v =>
                v.id === id ? { ...v, [field]: value } : v
            )
        }));
    };

    const setMainVariant = (id) => {
        setValues(prev => ({
            ...prev,
            variants: prev.variants.map(v => ({ ...v, isMain: v.id === id }))
        }));
    };

    const handleImageUpload = (id, e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, you'd upload this or create a preview URL
            const previewUrl = URL.createObjectURL(file);
            updateVariant(id, 'image', { file, previewUrl, name: file.name });
        }
    };

    const subCategoryOptions = React.useMemo(() => {
        return subCategories.map(sub => ({
            value: sub.id,
            label: sub.nameAr || sub.name
        }));
    }, [subCategories]);

    const brandOptions = React.useMemo(() => {
        return brands.map(brand => ({
            value: brand.id,
            label: brand.nameAr || brand.name
        }));
    }, [brands]);

    const unitOptions = React.useMemo(() => {
        return units.map(u => ({
            value: u.value,
            label: lang === 'en' ? u.labelEn : u.labelAr
        }));
    }, [lang]);

    const itemClasses = "pl-2 pr-8 [&>span]:left-auto [&>span]:right-2 text-right";

    return (
        <>
            <div className="p-6 space-y-6 min-h-screen bg-gray-50/50" dir="rtl">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            size="icon"
                            onClick={() => router.back()}
                            className="h-10 w-10 rounded-lg bg-white border-gray-100 shadow-md hover:bg-gray-100"
                        >
                            <LuChevronRight className="h-6 w-6 text-gray-600" />
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900">إضافة جديدة</h1>
                    </div>
                </div>

                {/* Content Switcher */}
                <div className="mt-6">
                    <Tabs defaultValue="single" dir="rtl" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
                            <TabsTrigger value="single">منتج واحد</TabsTrigger>
                            <TabsTrigger value="bulk">رفع ملف (Bulk)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="single">
                            {/* Product Info Section */}
                            <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-6 text-gray-800">معلومات المنتج</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Category */}
                                    <div className="space-y-2">
                                        <Label>التصنيف الرئيسي</Label>
                                        <Combobox
                                            options={categoryOptions}
                                            value={values.category}
                                            onChange={(v) => {
                                                console.log("Selected Category ID:", v);
                                                setValues(prev => ({ ...prev, category: v }));
                                            }}
                                            placeholder="اختر التصنيف"
                                        />
                                        {touched.category && errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
                                    </div>

                                    {/* Sub Category */}
                                    <div className="space-y-2">
                                        <Label>التصنيف الفرعي</Label>
                                        <Combobox
                                            options={subCategoryOptions}
                                            value={values.subCategory}
                                            onChange={(v) => setValues(prev => ({ ...prev, subCategory: v }))}
                                            placeholder={!values.category ? "اختر التصنيف أولا" : "اختر التصنيف الفرعي"}
                                            disabled={!values.category}
                                        />
                                        {touched.subCategory && errors.subCategory && <p className="text-red-500 text-xs">{errors.subCategory}</p>}
                                    </div>

                                    {/* Brand */}
                                    <div className="space-y-2">
                                        <Label>العلامة التجارية</Label>
                                        <Combobox
                                            options={brandOptions}
                                            value={values.brand}
                                            onChange={(v) => setValues(prev => ({ ...prev, brand: v }))}
                                            placeholder={!values.subCategory ? "اختر التصنيف الفرعي أولا" : "اختر العلامة التجارية"}
                                            disabled={!values.subCategory}
                                        />
                                        {touched.brand && errors.brand && <p className="text-red-500 text-xs">{errors.brand}</p>}
                                    </div>



                                    {/* Name AR */}
                                    <div className="space-y-2">
                                        <Label>اسم المنتج (لغة عربية)</Label>
                                        <Input
                                            name="nameAr"
                                            value={values.nameAr}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className=''
                                            placeholder="مثال: حليب كامل الدسم"
                                        />
                                        {touched.nameAr && errors.nameAr && <p className="text-red-500 text-xs">{errors.nameAr}</p>}
                                    </div>

                                    {/* Name EN */}
                                    <div className="space-y-2">
                                        <Label>اسم المنتج (لغة إنجليزية)</Label>
                                        <Input
                                            name="nameEn"
                                            value={values.nameEn}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className=''
                                            placeholder="Ex: Full Fat Milk"
                                            dir="ltr"
                                        />
                                        {touched.nameEn && errors.nameEn && <p className="text-red-500 text-xs">{errors.nameEn}</p>}
                                    </div>

                                    {/* Description */}
                                    {/* <div className="md:col-span-2 space-y-2">
                                <Label>وصف المنتج</Label>
                                <Input
                                    name="description"
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className=''
                                    placeholder="وصف مختصر للمنتج..."
                                />
                            </div> */}
                                    {/* Has VAT */}
                                    <div className="flex items-center gap-3 space-x-5 pt-8">
                                        <Checkbox
                                            id="vat"
                                            checked={values.hasVat}
                                            onCheckedChange={(checked) => setValues(prev => ({ ...prev, hasVat: checked }))}
                                        />
                                        <Label htmlFor="vat" className="mr-2 cursor-pointer">خاضع لضريبة القيمة المضافة</Label>
                                    </div>
                                </div>
                            </div>


                            {/* Variants Section */}
                            <div className="bg-white rounded-xl border shadow-sm p-6">
                                <h2 className="text-lg font-semibold mb-6 text-gray-800">خيارات الوزن والوحدات</h2>
                                {errors.variants && typeof errors.variants === 'string' && <p className="text-red-500 text-xs mb-4">{errors.variants}</p>}

                                <div className="space-y-6">
                                    {values.variants.map((variant, index) => (
                                        <div key={variant.id} className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 rounded-lg border border-gray-100 bg-gray-50/30 hover:border-gray-200 transition-colors">
                                            {/* Inputs Column */}
                                            <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="flex gap-2">
                                                    <div className="flex-1 space-y-2">
                                                        <Label>الوزن</Label>
                                                        <Input
                                                            type="number"
                                                            value={variant.weight}
                                                            onChange={(e) => updateVariant(variant.id, 'weight', e.target.value)}
                                                        />
                                                        {errors[`variants[${index}].weight`] && <p className="text-red-500 text-xs">{errors[`variants[${index}].weight`]}</p>}
                                                    </div>
                                                    <div className="w-1/3 space-y-2">
                                                        <Label>&nbsp;</Label>
                                                        <Combobox
                                                            options={unitOptions}
                                                            value={variant.unit}
                                                            onChange={(v) => updateVariant(variant.id, 'unit', v)}
                                                            placeholder={lang === 'en' ? "Unit" : "الوحدة"}
                                                            className='py-2.5 shadow'
                                                        />
                                                        {errors[`variants[${index}].unit`] && <p className="text-red-500 text-xs">{errors[`variants[${index}].unit`]}</p>}
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>وصف الصنف (لغة عربية)</Label>
                                                    <Input
                                                        value={variant.descAr}
                                                        onChange={(e) => updateVariant(variant.id, 'descAr', e.target.value)}
                                                    />
                                                    {errors[`variants[${index}].descAr`] && <p className="text-red-500 text-xs">{errors[`variants[${index}].descAr`]}</p>}
                                                </div>

                                                <div className="space-y-2 md:col-span-2">
                                                    <Label>وصف الصنف (لغة إنجليزية)</Label>
                                                    <Input
                                                        value={variant.descEn}
                                                        onChange={(e) => updateVariant(variant.id, 'descEn', e.target.value)}
                                                        dir="ltr"
                                                    />
                                                    {errors[`variants[${index}].descEn`] && <p className="text-red-500 text-xs">{errors[`variants[${index}].descEn`]}</p>}
                                                </div>
                                            </div>

                                            {/* Image Column */}
                                            <div className="lg:col-span-3 flex flex-col items-center justify-center gap-3 border-r border-gray-200 pr-0 lg:pr-6">
                                                <div className="relative w-full aspect-video bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center overflow-hidden hover:bg-gray-50 transition-colors group cursor-pointer">
                                                    <input
                                                        type="file"
                                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        accept="image/*"
                                                        onChange={(e) => handleImageUpload(variant.id, e)}
                                                    />
                                                    {variant.image ? (
                                                        <>
                                                            <img src={variant.image.previewUrl} alt="Preview" className="w-full h-full object-contain" />
                                                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate text-center">
                                                                {variant.image.name}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex flex-col items-center text-gray-400">
                                                            <LuImage className="w-8 h-8 mb-2" />
                                                            <span className="text-xs">رفع صورة</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {errors[`variants[${index}].image`] && <p className="text-red-500 text-xs">{errors[`variants[${index}].image`]}</p>}

                                                <div className="flex items-center gap-5 w-full justify-center">
                                                    <div
                                                        className="flex items-center gap-2 cursor-pointer"
                                                        onClick={() => setMainVariant(variant.id)}
                                                    >
                                                        <div className={cn(
                                                            "w-4 h-4 rounded-full border flex items-center justify-center",
                                                            variant.isMain ? "border-teal-600" : "border-gray-300"
                                                        )}>
                                                            {variant.isMain && <div className="w-2 h-2 rounded-full bg-teal-600" />}
                                                        </div>
                                                        <span className="text-xs text-gray-600 select-none">اختيار كصورة رئيسية</span>
                                                    </div>
                                                    {/* Delete Button */}
                                                    {index !== 0 && (
                                                        <div className="">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-red-500 bg-red-200 hover:bg-red-600 hover:text-red-50 h-8 w-8"
                                                                onClick={() => removeVariant(variant.id)}
                                                            >
                                                                <LuTrash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                    ))}

                                    <Button
                                        variant="outline"
                                        className="w-full border-dashed border-2 h-12 gap-2 text-gray-600 hover:text-teal-600 hover:border-teal-600 hover:bg-teal-50"
                                        onClick={addVariant}
                                    >
                                        <LuPlus className="w-5 h-5" />
                                        إضافة وزن
                                    </Button>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    className="bg-teal-500 hover:bg-teal-600 text-white min-w-[140px] gap-2"
                                    onClick={handleSubmit}
                                    disabled={isCreating}
                                >
                                    {isCreating ? "جاري الإضافة..." : (
                                        <>
                                            <LuPlus className="w-5 h-5" />
                                            إضافة المنتج
                                        </>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="bulk">
                            <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
                                <h2 className="text-lg font-semibold mb-6 text-gray-800">رفع ملف منتجات</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    {/* Bulk Category */}
                                    <div className="space-y-2">
                                        <Label>التصنيف الرئيسي</Label>
                                        <Combobox
                                            options={categoryOptions}
                                            value={bulkValues.category}
                                            onChange={(v) => setBulkValues(prev => ({ ...prev, category: v, subCategory: '', brand: '' }))}
                                            placeholder="اختر التصنيف"
                                        />
                                        {bulkErrors.category && <p className="text-red-500 text-xs">{bulkErrors.category}</p>}
                                    </div>

                                    {/* Bulk Sub Category */}
                                    <div className="space-y-2">
                                        <Label>التصنيف الفرعي</Label>
                                        <Combobox
                                            options={bulkSubCategoryOptions}
                                            value={bulkValues.subCategory}
                                            onChange={(v) => setBulkValues(prev => ({ ...prev, subCategory: v, brand: '' }))}
                                            placeholder={!bulkValues.category ? "اختر التصنيف أولا" : "اختر التصنيف الفرعي"}
                                            disabled={!bulkValues.category}
                                        />
                                        {bulkErrors.subCategory && <p className="text-red-500 text-xs">{bulkErrors.subCategory}</p>}
                                    </div>

                                    {/* Bulk Brand */}
                                    <div className="space-y-2">
                                        <Label>العلامة التجارية</Label>
                                        <Combobox
                                            options={bulkBrandOptions}
                                            value={bulkValues.brand}
                                            onChange={(v) => setBulkValues(prev => ({ ...prev, brand: v }))}
                                            placeholder={!bulkValues.subCategory ? "اختر التصنيف الفرعي أولا" : "اختر العلامة التجارية"}
                                            disabled={!bulkValues.subCategory}
                                        />
                                        {bulkErrors.brand && <p className="text-red-500 text-xs">{bulkErrors.brand}</p>}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <FileUploader
                                        key={fileUploaderKey}
                                        title="رفع ملف إكسيل"
                                        subtitle="قم برفع ملف المنتجات بصيغة . xlsx أو .xls"
                                        maxFiles={1}
                                        accept={{
                                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                                            "application/vnd.ms-excel": [".xls"]
                                        }}
                                        autoUpload={false}
                                        onFilesChange={(files) => {
                                            const fileWrapper = files[0];
                                            setBulkValues(prev => ({ ...prev, file: fileWrapper?.file || null }));
                                            if (files.length > 0) setBulkErrors(prev => ({ ...prev, file: null }));
                                        }}
                                    />
                                    {bulkErrors.file && <p className="text-red-500 text-xs mt-2">{bulkErrors.file}</p>}
                                </div>
                                <div>
                                    {bulkResponse && bulkResponse.data && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                                            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">تفاصيل العملية</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="bg-white p-3 rounded border shadow-sm">
                                                    <span className="block text-gray-500 text-xs mb-1">إجمالي الصفوف</span>
                                                    <span className="font-bold text-lg">{bulkResponse.data.totalRows}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded border border-green-100 shadow-sm">
                                                    <span className="block text-green-600 text-xs mb-1">تمت الإضافة بنجاح</span>
                                                    <span className="font-bold text-green-700 text-lg">{bulkResponse.data.successCount}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                                                    <span className="block text-red-600 text-xs mb-1">فشل في الإضافة</span>
                                                    <span className="font-bold text-red-700 text-lg">{bulkResponse.data.failedCount}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">تقرير الأخطاء:</h4>
                                                {bulkResponse.data.errors && bulkResponse.data.errors.length > 0 ? (
                                                    <div className="bg-red-50 border border-red-200 rounded p-3 max-h-60 overflow-y-auto">
                                                        <ul className="list-disc list-inside space-y-1">
                                                            {bulkResponse.data.errors.map((error, idx) => (
                                                                <li key={idx} className="text-red-600 text-xs md:text-sm font-medium">
                                                                    {error}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded border border-green-200">
                                                        <span>✓</span>
                                                        <span className="font-medium">لا توجد أخطاء في الملف</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end mt-5">
                                    <Button
                                        className="bg-teal-500 hover:bg-teal-600 text-white min-w-[140px] gap-2"
                                        onClick={onBulkSubmit}
                                        disabled={isBulkUploading}
                                    >
                                        {isBulkUploading ? "جاري الرفع..." : (
                                            <>
                                                <LuFileUp className="w-5 h-5" />
                                                رفع الملف
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default AddProductPage;