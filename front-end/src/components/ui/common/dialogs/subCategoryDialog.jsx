"use client"

import React, { useState, useEffect } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import Input from "@/components/ui/common/reusable-input/reusableInput"
import FileUploader from "@/components/ui/common/file-uploader/fileUploader"
import { Button } from "@/components/ui/button"
import useForm from "@/hooks/useForm"
import { useQueryFetch, useMutationFetch } from '@/hooks/useQueryFetch'
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { normalizeErrors } from "@/app/services/errorNormalizer"
import { getErrorMessage } from "@/app/services/errorHandler"
import { useValidationI18nSchemas } from "@/hooks/useTranslatedValidation"
import { Combobox } from "@/components/ui/common/combo-box/comboBox"

export default function SubCategoryDialog({
    triggerNode = null,
    mode = 'create',
    initialData = null,
    open: openProp = undefined,
    onOpenChange: onOpenChangeProp = null
}) {
    const [open, setOpen] = useState(false)
    const isControlled = openProp !== undefined
    const isOpen = isControlled ? openProp : open
    const isCreate = mode === 'create'

    const searchParams = useSearchParams()
    const lang = searchParams.get("lang") || "en"
    const { schemas } = useValidationI18nSchemas()
    const queryClient = useQueryClient()
    const [bulkResponse, setBulkResponse] = useState(null)
    const [fileUploaderKey, setFileUploaderKey] = useState(0)

    // Fetch Categories for Combobox
    const { data: categoriesData } = useQueryFetch(['allCategories'], '/api/category/withallname');
    const categoryOptions = React.useMemo(() => {
        const data = categoriesData?.data;
        const categories = Array.isArray(data) ? data : (data?.items || []);
        
        return categories.map(c => ({
            value: c.id,
            label: lang === 'ar' ? (c.name_AR || c.nameAr || c.name) : (c.name_EN || c.nameEn || c.name)
        }));
    }, [categoriesData, lang]);


    const initialValues = {
        nameAr: "",
        nameEn: "",
        image: null,
        parentCategoryId: "",
        bulkCategoryId: "",
    }

    const onSubmit = (values) => {
        console.log("Submitting values:", values);
        const formData = new FormData();

        // Translations
        formData.append('SubCategoryTranslations[0].Name', values.nameEn);
        formData.append('SubCategoryTranslations[0].LanguageCode', 'en-US');
        formData.append('SubCategoryTranslations[1].Name', values.nameAr);
        formData.append('SubCategoryTranslations[1].LanguageCode', 'ar-EG');
        formData.append('ParentCategoryId', values.parentCategoryId);

        if (values.image) {
            formData.append('Img', values.image);
        }

        if (!isCreate) {
            formData.append('Id', initialData?.id);
        }

        if (isCreate) {
            createMutation.mutate(formData);
        } else {
            updateMutation.mutate(formData);
        }
    }

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setErrors, setTouched, resetForm } = useForm(
        initialValues,
        schemas.subCategorySchema,
        onSubmit
    )

    useEffect(() => {
        if (isOpen) {
            setBulkResponse(null);
            if (mode === 'update' && initialData) {
                const translations = initialData.subCategoryTranslations || initialData.SubCategoryTranslations || initialData._raw?.subCategoryTranslations || initialData._raw?.SubCategoryTranslations || [];

                const getTranslation = (prefix) => {
                    const item = translations.find(t => {
                        const code = t.languageCode || t.LanguageCode || "";
                        return code.toLowerCase().startsWith(prefix);
                    });
                    return item?.name || item?.Name;
                };

                let nameAr = initialData.name_AR || getTranslation('ar');
                let nameEn = initialData.name_EN || getTranslation('en');

                // Fallback to initialData.name based on current language if translation is missing
                if (!nameAr && lang === 'ar') { nameAr = initialData.name; nameEn = initialData.name };
                if (!nameEn && lang === 'en') nameEn = initialData.name || "";

                let parentCategoryId = initialData.parentCategoryId || initialData.ParentCategoryId || "";

                // Handle categories array from new API structure if parentCategoryId is missing
                if (!parentCategoryId && initialData.categories?.length > 0) {
                    // Prefer ID or CategoryKey if present
                    parentCategoryId = initialData.categories[0].id;
                }

                setValues({
                    nameAr: nameAr || "",
                    nameEn: nameEn || "",
                    image: null,
                    parentCategoryId: parentCategoryId || "",
                })
            } else {
                resetForm();
            }
        }
    }, [isOpen, mode, initialData, lang]);

    const createMutation = useMutationFetch({
        url: '/api/subcategory/create',
        options: { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allSubCategories'] });
                queryClient.invalidateQueries({ queryKey: ['subCategories'] });
                toast.success(lang === 'en' ? "Sub Category created successfully" : "تم إنشاء التصنيف الفرعي بنجاح");
                handleOpenChange(false);

            },
            onError: (err) => {
                const message = getErrorMessage(err);
                toast.error(message || (lang === 'en' ? "Error creating sub category" : "حدث خطأ أثناء إنشاء التصنيف الفرعي"));
                if (err?.response?.data?.errors) {
                    setErrors(normalizeErrors(err.response.data.errors));
                }
            }
        }
    })

    const updateMutation = useMutationFetch({
        url: '/api/subcategory',
        options: { method: 'PUT', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allSubCategories'] });
                queryClient.invalidateQueries({ queryKey: ['subCategories'] });
                toast.success(lang === 'en' ? "Sub Category updated successfully" : "تم تحديث التصنيف الفرعي بنجاح");
                handleOpenChange(false);
            },
            onError: (err) => {
                const message = getErrorMessage(err);
                toast.error(message || (lang === 'en' ? "Error updating sub category" : "حدث خطأ أثناء تحديث التصنيف الفرعي"));
                if (err?.response?.data?.errors) {
                    setErrors(normalizeErrors(err.response.data.errors));
                }
            }
        }
    })

    const bulkUploadMutation = useMutationFetch({
        url: '/api/subcategory/bulk',
        options: { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ['allSubCategories'] });
                queryClient.invalidateQueries({ queryKey: ['subCategories'] });
                toast.success(lang === 'en' ? "Bulk upload successful" : "تم رفع الملف بنجاح");
                setBulkResponse(data);
                setFileUploaderKey(prev => prev + 1);
            },
            onError: (err) => {
                const message = getErrorMessage(err);
                toast.error(message || (lang === 'en' ? "Error uploading file" : "حدث خطأ أثناء رفع الملف"));
            }
        }
    })

    const handleBulkUpload = () => {
        if (!values.bulkFile) {
            toast.error(lang === 'en' ? "Please select a file" : "يرجى اختيار ملف");
            return;
        }
        if (!values.bulkCategoryId) {
            toast.error(lang === 'en' ? "Please select a category" : "يرجى اختيار التصنيف");
            return;
        }
        const formData = new FormData();
        formData.append('File', values.bulkFile);
        formData.append('ParentCategoryId', values.bulkCategoryId);
        bulkUploadMutation.mutate(formData);
    }

    const handleOpenChange = (val) => {
        if (!isControlled) setOpen(val)
        onOpenChangeProp?.(val)
    }
    
    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {triggerNode && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle>{isCreate ? (lang === 'ar' ? "إضافة تصنيف فرعي" : "Add Sub Category") : (lang === 'ar' ? "تعديل تصنيف فرعي" : "Update Sub Category")}</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {lang === 'ar' ? "أدخل بيانات التصنيف الفرعي لإتمام الإضافة" : "Enter sub category data to complete addition"}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Top Section: Sub Category Data */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-sm">{lang === 'ar' ? "بيانات التصنيف الفرعي" : "Sub Category Data"}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-5">
                                <Input
                                    label={lang === 'ar' ? "اسم التصنيف الفرعي (لغة عربية)" : "Sub Category Name (Arabic)"}
                                    name="nameAr"
                                    value={values.nameAr}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.nameAr && errors.nameAr}
                                    placeholder={lang === 'ar' ? "أدخل الاسم بالعربية" : "Enter Arabic Name"}
                                />
                                {touched.nameAr && errors.nameAr && (
                                    <p className="text-xs text-red-500">{errors.nameAr}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-5">
                                <Input
                                    label={lang === 'ar' ? "اسم التصنيف الفرعي (لغة إنجليزية)" : "Sub Category Name (English)"}
                                    name="nameEn"
                                    value={values.nameEn}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={touched.nameEn && errors.nameEn}
                                    placeholder={"Enter English Name"}
                                    dir="ltr"
                                />
                                {touched.nameEn && errors.nameEn && (
                                    <p className="text-xs text-red-500">{errors.nameEn}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-5">
                                <label className="text-xs font-semibold">{lang === 'ar' ? "التصنيف الرئيسي" : "Parent Category"}</label>
                                <Combobox
                                    options={categoryOptions}
                                    value={values.parentCategoryId}
                                    onChange={(val) => {
                                        setValues(prev => ({ ...prev, parentCategoryId: val }))
                                        if (errors.parentCategoryId) setErrors(prev => ({ ...prev, parentCategoryId: "" }))
                                    }}
                                    placeholder={lang === 'ar' ? "اختر التصنيف" : "Select Category"}
                                />
                                {touched.parentCategoryId && errors.parentCategoryId && (
                                    <p className="text-xs text-red-500">{errors.parentCategoryId}</p>
                                )}
                            </div>
                        </div>


                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">{lang === 'ar' ? "صورة التصنيف الفرعي" : "Sub Category Image"}</label>
                            <FileUploader
                                onFilesChange={(files) => setValues(prev => ({ ...prev, image: files[0]?.file }))}
                                maxFiles={1}
                                autoUpload={false}
                                acceptedFileTypes={{ 'image/*': ['.png', '.jpg', '.jpeg', '.svg'] }}
                                title={lang === 'ar' ? "اسحب الملف هنا للبدء بالرفع أو تصفح الملفات" : "Drag file here or browse"}
                                subtitle={lang === 'ar' ? "الملفات المدعومة: svg, png, jpg" : "Supported files: svg, png, jpg"}
                            />
                            {touched.image && errors.image && (
                                <p className="text-xs text-red-500">{errors.image}</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleSubmit} disabled={isPending} className="bg-teal-500 hover:bg-teal-600 text-white w-28 text-center">
                                {isPending ? (lang === 'ar' ? "جاري الحفظ..." : "Saving...") : (isCreate ? (lang === 'ar' ? "إضافة البيانات" : "Add Data") : (lang === 'ar' ? "تحديث البيانات" : "Update Data"))}
                            </Button>
                        </div>
                    </div>

                    {/* OR Section - Hidden in Create Mode as requested */}
                    {isCreate && (
                        <>
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        {lang === 'ar' ? "أو" : "OR"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm">{lang === 'ar' ? "ارفع ملف التصنيف الفرعي" : "Upload Sub Category File"}</h3>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">{lang === 'ar' ? "التصنيف الرئيسي" : "Parent Category"}</label>
                                    <Combobox
                                        options={categoryOptions}
                                        value={values.bulkCategoryId}
                                        onChange={(val) => setValues(prev => ({ ...prev, bulkCategoryId: val }))}
                                        placeholder={lang === 'ar' ? "اختر التصنيف" : "Select Category"}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">{lang === 'ar' ? "بيانات ملف التصنيف الفرعي" : "Sub Category File Data"}</label>
                                    <FileUploader
                                        key={fileUploaderKey}
                                        onFilesChange={(files) => setValues(prev => ({ ...prev, bulkFile: files[0]?.file }))}
                                        maxFiles={1}
                                        autoUpload={false}
                                        title={lang === 'ar' ? "اسحب الملف هنا للبدء بالرفع أو تصفح الملفات" : "Drag file here or browse"}
                                        subtitle={lang === 'ar' ? "الملفات المدعومة: xlsx" : "Supported files: xlsx"}
                                        acceptedFileTypes={{ '.xlsx': ['.xlsx'] }}
                                    />
                                    <Button
                                        onClick={handleBulkUpload}
                                        disabled={bulkUploadMutation.isPending}
                                        className="w-full mt-2 bg-teal-500 hover:bg-teal-600 text-white"
                                    >
                                        {bulkUploadMutation.isPending ? (lang === 'ar' ? "جاري الرفع..." : "Uploading...") : (lang === 'ar' ? "رفع الملف" : "Upload File")}
                                    </Button>
                                </div>
                                <div className="">
                                    {bulkResponse && bulkResponse.data && (
                                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                                            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">{lang === 'ar' ? "تفاصيل العملية" : "Operation Details"}</h3>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="bg-white p-3 rounded border shadow-sm">
                                                    <span className="block text-gray-500 text-xs mb-1">{lang === 'ar' ? "إجمالي الصفوف" : "Total Rows"}</span>
                                                    <span className="font-bold text-lg">{bulkResponse.data.totalRows}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded border border-green-100 shadow-sm">
                                                    <span className="block text-green-600 text-xs mb-1">{lang === 'ar' ? "تمت الإضافة بنجاح" : "Success"}</span>
                                                    <span className="font-bold text-green-700 text-lg">{bulkResponse.data.successCount}</span>
                                                </div>
                                                <div className="bg-white p-3 rounded border border-red-100 shadow-sm">
                                                    <span className="block text-red-600 text-xs mb-1">{lang === 'ar' ? "فشل في الإضافة" : "Failed"}</span>
                                                    <span className="font-bold text-red-700 text-lg">{bulkResponse.data.failedCount}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h4 className="font-semibold text-gray-700 mb-2">{lang === 'ar' ? "تقرير الأخطاء:" : "Errors Report:"}</h4>
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
                                                        <span className="font-medium">{lang === 'ar' ? "لا توجد أخطاء في الملف" : "No errors found"}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending || bulkUploadMutation.isPending}>
                        {lang === 'ar' ? "إلغاء" : "Cancel"}
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
