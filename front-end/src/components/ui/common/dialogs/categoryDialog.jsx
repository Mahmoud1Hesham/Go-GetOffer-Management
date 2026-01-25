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
import { useMutationFetch } from '@/hooks/useQueryFetch'
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"
import { normalizeErrors } from "@/app/services/errorNormalizer"
import { getErrorMessage } from "@/app/services/errorHandler"
import { useValidationI18nSchemas } from "@/hooks/useTranslatedValidation"

export default function CategoryDialog({
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


    const initialValues = {
        nameAr: "",
        nameEn: "",
        image: null,
    }

    const onSubmit = (values) => {
        const formData = new FormData();

        // Translations
        formData.append('CategoryTranslations[0].Name', values.nameEn);
        formData.append('CategoryTranslations[0].LanguageCode', 'en-US');
        formData.append('CategoryTranslations[1].Name', values.nameAr);
        formData.append('CategoryTranslations[1].LanguageCode', 'ar-EG');

        if (values.image) {
            formData.append('Img', values.image);
        }

        // If update mode and bottom section is used? 
        // Assuming standard create/update for now.
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
        schemas.categorySchema,
        onSubmit
    )

    useEffect(() => {
        if (isOpen) {
            if (mode === 'update' && initialData) {
                setValues({
                    nameAr: initialData.name_AR || initialData.nameAr || "",
                    nameEn: initialData.name_EN || initialData.nameEn || "",
                    image: null,
                })
            } else {
                resetForm();
            }
        }
    }, [isOpen, mode, initialData]);

    const createMutation = useMutationFetch({
        url: '/api/category/create', // Placeholder endpoint
        options: { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allCategories'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                toast.success(lang === 'en' ? "Category created successfully" : "تم إنشاء التصنيف بنجاح");
                handleOpenChange(false);

            },
            onError: (err) => {
                const message = getErrorMessage(err);
                toast.error(message || (lang === 'en' ? "Error creating category" : "حدث خطأ أثناء إنشاء التصنيف"));
                if (err?.response?.data?.errors) {
                    setErrors(normalizeErrors(err.response.data.errors));
                }
            }
        }
    })

    const updateMutation = useMutationFetch({
        url: '/api/category', // Placeholder endpoint
        options: { method: 'PUT', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allCategories'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                toast.success(lang === 'en' ? "Category updated successfully" : "تم تحديث التصنيف بنجاح");
                handleOpenChange(false);
            },
            onError: (err) => {
                const message = getErrorMessage(err);
                toast.error(message || (lang === 'en' ? "Error updating category" : "حدث خطأ أثناء تحديث التصنيف"));
                if (err?.response?.data?.errors) {
                    setErrors(normalizeErrors(err.response.data.errors));
                }
            }
        }
    })

    const bulkUploadMutation = useMutationFetch({
        url: '/api/category/bulk',
        options: { method: 'POST', headers: { 'Content-Type': 'multipart/form-data' } },
        mutationOptions: {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['allCategories'] });
                queryClient.invalidateQueries({ queryKey: ['categories'] });
                toast.success(lang === 'en' ? "Bulk upload successful" : "تم رفع الملف بنجاح");
                handleOpenChange(false);
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
        const formData = new FormData();
        formData.append('File', values.bulkFile);
        bulkUploadMutation.mutate(formData);
    }

    const handleOpenChange = (val) => {
        if (!isControlled) setOpen(val)
        onOpenChangeProp?.(val)
    }

    const isLoading = createMutation.isLoading || updateMutation.isLoading;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {triggerNode && <DialogTrigger asChild>{triggerNode}</DialogTrigger>}
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <DialogHeader>
                    <DialogTitle>{isCreate ? (lang === 'ar' ? "إضافة تصنيف" : "Add Category") : (lang === 'ar' ? "تعديل تصنيف" : "Update Category")}</DialogTitle>
                    <div className="text-sm text-muted-foreground">
                        {lang === 'ar' ? "أدخل بيانات التصنيف لإتمام الإضافة" : "Enter category data to complete addition"}
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Top Section: Category Data */}
                    <div className="flex flex-col gap-4">
                        <h3 className="font-semibold text-sm">{lang === 'ar' ? "بيانات التصنيف" : "Category Data"}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-5">
                                <Input
                                    label={lang === 'ar' ? "اسم التصنيف (لغة عربية)" : "Category Name (Arabic)"}
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
                                    label={lang === 'ar' ? "اسم التصنيف (لغة إنجليزية)" : "Category Name (English)"}
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
                        </div>


                        {/* Image Upload */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold">{lang === 'ar' ? "صورة التصنيف" : "Category Image"}</label>
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
                            <Button onClick={handleSubmit} disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white w-28 text-center">
                                {isLoading ? (lang === 'ar' ? "جاري الحفظ..." : "Saving...") : (isCreate ? (lang === 'ar' ? "إضافة البيانات" : "Add Data") : (lang === 'ar' ? "تحديث البيانات" : "Update Data"))}
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
                                <h3 className="font-semibold text-sm">{lang === 'ar' ? "ارفع ملف التصنيف" : "Upload Category File"}</h3>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold">{lang === 'ar' ? "بيانات ملف التصنيف" : "Category File Data"}</label>
                                    <FileUploader
                                        onFilesChange={(files) => setValues(prev => ({ ...prev, bulkFile: files[0]?.file }))}
                                        maxFiles={1}
                                        autoUpload={false}
                                        title={lang === 'ar' ? "اسحب الملف هنا للبدء بالرفع أو تصفح الملفات" : "Drag file here or browse"}
                                        subtitle={lang === 'ar' ? "الملفات المدعومة: xlsx" : "Supported files: xlsx"}
                                        acceptedFileTypes={{ '.xlsx': ['.xlsx'] }}
                                    />
                                    <Button
                                        onClick={handleBulkUpload}
                                        disabled={bulkUploadMutation.isLoading}
                                        className="w-full mt-2 bg-teal-500 hover:bg-teal-600 text-white"
                                    >
                                        {bulkUploadMutation.isLoading ? (lang === 'ar' ? "جاري الرفع..." : "Uploading...") : (lang === 'ar' ? "رفع الملف" : "Upload File")}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
                        {lang === 'ar' ? "إلغاء" : "Cancel"}
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
