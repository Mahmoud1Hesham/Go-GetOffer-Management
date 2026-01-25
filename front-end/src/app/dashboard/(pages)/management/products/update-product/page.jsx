"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import Spinner from '@/components/ui/common/spinner/spinner';


const UpdateProductPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const [selectedType, setSelectedType] = useState('product');
    const { schemas, i18n } = useValidationI18nSchemas();
    const lang = i18n.language;


    const arActivities = activities.find(a => a.ar)?.ar || [];

    // Fetch Product Data
    const { data: productData, isLoading: isFetchingProduct } = useQueryFetch(
        ['product', id],
        `/api/catalog/search`,
        { params: { ProductId: id }, enabled: !!id }
    );

    // 1. Fetch Categories
    const { data: categoriesData } = useQueryFetch(['categories'], '/api/category');

    // 2. Process Categories to match with activities (icons)
    const processedCategories = React.useMemo(() => {
        if (!categoriesData?.data) return [];
        return categoriesData.data.map(cat => {
            // Match categoryKey from API with value in activities
            const activity = arActivities.find(a => a.value === (cat.categorykey || cat.categoryKey));
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

    const { mutate: updateProduct, isLoading: isUpdating } = useMutationFetch({
        url: '/api/product',
        options: { method: 'PUT', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                toast.success("تم تعديل المنتج بنجاح");
                router.push('/dashboard/management/products');
            },
            onError: (error) => {
                toast.error(error?.response?.data?.message || "حدث خطأ أثناء تعديل المنتج");
            }
        }
    });

    const onSubmit = (values) => {
        console.log("Submitting update values:", values);
        const formData = new FormData();
        formData.append('Id', id);
        formData.append('BrandId', values.brand);
        formData.append('IsTax', values.hasVat);

        // Product Translations
        formData.append('ProductTranslationDTOs[0].Name', values.nameEn);
        formData.append('ProductTranslationDTOs[0].LanguageCode', 'en-US');
        formData.append('ProductTranslationDTOs[1].Name', values.nameAr);
        formData.append('ProductTranslationDTOs[1].LanguageCode', 'ar-EG');

        // Variants
        values.variants.forEach((variant, index) => {
            if (variant.dbId) {
                formData.append(`ProductVariantDTOs[${index}].Id`, variant.dbId);
            }

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

        updateProduct(formData);
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
            { id: 1, weight: '', unit: 'milliliter', descAr: '', descEn: '', image: null, isMain: true }
        ]
    };

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setErrors, setTouched } = useForm(
        initialValues,
        schemas.productSchema,
        onSubmit
    );

    // Populate Form Data
    useEffect(() => {
        if (productData?.data) {
            const rawData = productData.data;
            const p = (rawData?.items && Array.isArray(rawData.items)) ? rawData.items[0] : rawData;

            if (!p) {
                console.warn("Product data is empty or formatting is incorrect", rawData);
                return;
            }

            console.log("Product Data for Update (Processed):", p);

            // 1. Direct Mapping (Priority based on User Provided API Response)
            // The API returns localized flat data (e.g. name, weightDisplay, description)

            // Name
            const nameAr = p.name || '';
            const nameEn = p.name || ''; // Fallback since API only gives one name

            // Variants
            const variantsSource = p.productVariants || [];
            const variants = variantsSource.map((v, idx) => {
                // Parse weight from "100 ملي" or similar
                const weightRaw = v.weightDisplay || '';
                const parts = weightRaw.trim().split(' ');
                const weight = parts[0];
                const rawUnit = parts.length > 1 ? parts.slice(1).join(' ') : '';

                // Helper to map API unit string to internal unit value
                const findUnitValue = (uStr) => {
                    if (!uStr) return 'milliliter'; // Default
                    const normalized = uStr.trim();

                    // Check match with units interface (value, labelEn, or labelAr)
                    const exact = units.find(u =>
                        u.value.toLowerCase() === normalized.toLowerCase() ||
                        u.labelEn.toLowerCase() === normalized.toLowerCase() ||
                        u.labelAr === normalized
                    );

                    return exact ? exact.value : 'milliliter';
                };

                return {
                    id: idx + 1,
                    dbId: v.id,
                    weight: weight || '',
                    unit: findUnitValue(rawUnit),
                    descAr: v.description || '',
                    descEn: v.description || '', // Fallback
                    image: v.imageUrl ? { previewUrl: v.imageUrl, name: 'Existing Image' } : null,
                    isMain: v.isMainImg
                };
            });

            if (variants.length === 0) {
                variants.push({ id: 1, weight: '', unit: 'milliliter', descAr: '', descEn: '', image: null, isMain: true });
            }

            // Categories/Brands extraction
            const validCategoryId = p.categories?.[0]?.id || p.categoryId || '';
            const validSubCategoryId = p.subCategories?.[0]?.id || p.subCategoryId || '';
            const validBrandId = p.brands?.[0]?.id || p.brandId || '';

            setValues({
                category: validCategoryId,
                subCategory: validSubCategoryId,
                brand: validBrandId,
                nameAr,
                nameEn,
                description: '',
                hasVat: p.isTax,
                variants
            });
        }
    }, [productData, setValues]);


    // 3. Fetch SubCategories based on selected Category ID
    const subCategoryFetchOptions = React.useMemo(() => ({
        method: 'POST',
        data: { Id: values.category }
    }), [values.category]);

    const { data: subCategoriesData } = useQueryFetch(
        ['subCategories', values.category],
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
        ['brands', values.subCategory],
        '/api/brand/subcategory',
        brandFetchOptions,
        { enabled: !!values.subCategory }
    );

    const subCategories = React.useMemo(() => subCategoriesData?.data || [], [subCategoriesData]);
    const brands = React.useMemo(() => brandsData?.data || [], [brandsData]);


    // Variant Handlers
    const addVariant = () => {
        const newId = values.variants.length > 0 ? Math.max(...values.variants.map(v => v.id)) + 1 : 1;
        setValues(prev => ({
            ...prev,
            variants: [...prev.variants, {
                id: newId,
                weight: '',
                unit: 'milliliter',
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

    if (isFetchingProduct) {
        return <div className="flex items-center justify-center min-h-screen"><Spinner /></div>;
    }

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
                        <h1 className="text-2xl font-bold text-gray-900">تعديل منتج</h1>
                    </div>

                </div>

                {/* Content Switcher */}
                <div className="mt-6">

                    <>
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
                                disabled={isUpdating}
                            >
                                {isUpdating ? "جاري التعديل..." : (
                                    <>
                                        <LuSave className="w-5 h-5" />
                                        حفظ التعديلات
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                </div>
            </div>
        </>
    );
};

export default UpdateProductPage;
