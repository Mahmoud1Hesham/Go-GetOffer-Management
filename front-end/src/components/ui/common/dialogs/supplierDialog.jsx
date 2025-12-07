"use client"

import React, { useMemo, useState, useEffect } from "react"
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
import MultiSelectInput, { activities } from "@/components/ui/common/multi-select-input/multiSelectInput"
import { useSearchParams } from "next/navigation"
import { Combobox } from "@/components/ui/common/combo-box/comboBox"
import FileUploader from "@/components/ui/common/file-uploader/fileUploader"
import { Button } from "@/components/ui/button"
import useForm from "@/hooks/useForm"
import { useValidationI18nSchemas } from "@/hooks/useTranslatedValidation"
export default function SupplierDialog({ triggerNode = null, mode = 'create', initialData = null, onCreate = null, onUpdate = null, open: openProp = undefined, onOpenChange: onOpenChangeProp = null }) {
    const [open, setOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(mode === 'create');

    const errorClass = (field) =>
        errors[field] && touched[field] ? "border-red-600 ring-1 ring-red-600 rounded-md" : ""

    // useForm for validation and state
    const initialValues = {
        companyName: "",
        fullName: "",
        phoneNumbers: [""],
        email: "",
        activities: [],
        governorate: "",
        city: "",
        mainBranch: "",
        postalCode: "",
        addressDetails: "",
    }

    const onSubmit = (values) => {
        if (mode === 'update') {
            if (typeof onUpdate === 'function') onUpdate(values);
            else console.log('UpdateSupplier payload (validated):', values);
        } else {
            if (typeof onCreate === 'function') onCreate(values);
            else console.log('CreateSupplier payload (validated):', values);
        }
        // close dialog (controlled parent should handle close via onOpenChangeProp)
        if (typeof onOpenChangeProp === 'function') onOpenChangeProp(false);
        else setOpen(false);
        // reset editing state for next open
        setIsEditing(mode === 'create');
    }
    const { schemas } = useValidationI18nSchemas();

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setErrors, setTouched } = useForm(
        initialValues,
        schemas.supplierInfoSchema,
        onSubmit
    )

    // Helper to map incoming initialData to form shape
    function mapInitial(data) {
        if (!data) return initialValues;
        return {
            id: data.id ?? null,
            companyName: data.companyName ?? data.name ?? "",
            fullName: data.fullName ?? "",
            phoneNumbers: data.phoneNumbers ?? (data.phone ? [data.phone] : [""]),
            email: data.email ?? "",
            activities: data.activities ?? [],
            governorate: data.governorate ?? "",
            city: data.city ?? "",
            mainBranch: data.mainBranch ?? data.branch ?? "",
            postalCode: data.postalCode ?? "",
            addressDetails: data.addressDetails ?? data.address ?? "",
        };
    }

    const searchParams = useSearchParams()
    const lang = searchParams.get("lang") || (typeof i18n !== "undefined" ? i18n.language : "en") || "en"
    const activityOptions = lang === "en" ? activities[0].en : activities[1].ar

    // sample options for governorates and cities
    const governorates = [
        { label: "القاهرة", value: "cairo" },
        { label: "الجيزة", value: "giza" },
        { label: "الإسكندرية", value: "alex" },
    ]

    const citiesMap = {
        cairo: [
            { label: "مدينة نصر", value: "nasr" },
            { label: "المعادي", value: "maadi" },
        ],
        giza: [
            { label: "الهرم", value: "haram" },
            { label: "الجيزة", value: "giza-city" },
        ],
        alex: [
            { label: "سيدي جابر", value: "sidi" },
            { label: "ستانلي", value: "stanley" },
        ],
    }

    const cityOptions = useMemo(() => {
        // values.governorate may be either the option `value` (e.g. 'cairo')
        // or (in some code paths) accidentally the displayed label (e.g. 'القاهرة').
        // Try the key directly first, otherwise try to resolve by label.
        const direct = citiesMap[values.governorate]
        if (direct) return direct

        const byLabel = governorates.find((g) => String(g.label) === String(values.governorate))
        if (byLabel && citiesMap[byLabel.value]) return citiesMap[byLabel.value]

        return []
    }, [values.governorate])

    // local submit uses useForm's handleSubmit

    // When dialog opens in update mode, prefill values and disable editing
    const handleOpenChange = (v) => {
        setOpen(v);
        if (v) {
            if (mode === 'update') {
                setValues(mapInitial(initialData));
                setIsEditing(false);
            } else {
                setValues(initialValues);
                setIsEditing(true);
            }
            // ensure previous validation errors/touched flags are cleared
            setErrors({});
            setTouched({});
        } else {
            // closing: reset form state to initialValues and reset editing flag
            setValues(initialValues);
            setErrors({});
            setTouched({});
            setIsEditing(mode === 'create');
        }

        // notify parent if controlled
        if (typeof onOpenChangeProp === 'function') onOpenChangeProp(v);
    }

    // if parent controls `open`, respond to changes and run the same prefill/reset logic
    useEffect(() => {
        if (typeof openProp !== 'undefined') {
            // only run when parent explicitly controls open
            handleOpenChange(Boolean(openProp));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openProp, initialData]);

    return (
        <Dialog open={typeof openProp !== 'undefined' ? openProp : open} onOpenChange={handleOpenChange}>
            {/* If a `triggerNode` is provided by a parent (e.g. header), use it as the Dialog trigger via `asChild`. */}
            {triggerNode ? (
                <DialogTrigger asChild>{triggerNode}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="default">إضافة المورد</Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-4xl supplier-dialog max-h-[80vh] overflow-y-auto">
                <style>{`.supplier-dialog .absolute.right-4.top-4{ right: auto; left: 1rem; }`}</style>
                <DialogHeader className="flex items-start justify-between">
                    <DialogTitle className="ml-auto text-right">{mode === 'update' ? 'تعديل مورد' : 'إضافة مورد جديد'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4">
                    {/* Top row: name and phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                name="companyName"
                                placeholder="اسم الكيان"
                                value={values.companyName}
                                onChange={(e) => { if (mode === 'update' && !isEditing) return; handleChange(e); }}
                                onBlur={(e) => handleBlur(e)}
                                className={errorClass("companyName")}
                                disabled={mode === 'update' && !isEditing}
                            />
                            {errors.companyName && touched.companyName && (
                                <div className="text-sm text-red-600 mt-2 ">{errors.companyName}</div>
                            )}
                        </div>

                        <div>
                            <Input
                                name="phoneNumbers"
                                placeholder="رقم الهاتف"
                                value={values.phoneNumbers?.[0] ?? ""}
                                onChange={(e) => {
                                    if (mode === 'update' && !isEditing) return;
                                    const v = e.target.value
                                    setValues({ ...values, phoneNumbers: [v] })
                                }}
                                onBlur={(e) => handleBlur({ target: { name: "phoneNumbers" } })}
                                className={errorClass("phoneNumbers")}
                                disabled={mode === 'update' && !isEditing}
                            />
                            {errors.phoneNumbers && touched.phoneNumbers && (
                                <div className="text-sm text-red-600 mt-2 ">{errors.phoneNumbers}</div>
                            )}
                        </div>
                    </div>

                    {/* second row: activity (multiselect) and join date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <MultiSelectInput
                                options={activityOptions}
                                value={values.activities}
                                onValueChange={(v) => {
                                    if (mode === 'update' && !isEditing) return;
                                    // update values immediately
                                    setValues({ ...values, activities: v })
                                    // mark touched
                                    setTouched({ ...touched, activities: true })

                                    // validate activities using the translated schema with the new value
                                    schemas.supplierInfoSchema
                                        .validateAt('activities', { ...values, activities: v })
                                        .then(() => setErrors((prev) => ({ ...prev, activities: "" })))
                                        .catch((err) => setErrors((prev) => ({ ...prev, activities: err.message })));
                                }}
                                placeholder="اختر الأنشطة"
                                className={errorClass("activities")}
                                disabled={mode === 'update' && !isEditing}
                            />
                            {errors.activities && touched.activities && (
                                <div className="text-sm text-red-600 mt-2">{errors.activities}</div>
                            )}
                        </div>

                        <div>
                            <Input
                                name="email"
                                placeholder="البريد الإلكتروني"
                                type="email"
                                value={values.email}
                                onChange={(e) => { if (mode === 'update' && !isEditing) return; handleChange(e); }}
                                onBlur={(e) => handleBlur(e)}
                                className={errorClass("email")}
                                disabled={mode === 'update' && !isEditing}
                            />
                            {errors.email && touched.email && (
                                <div className="text-sm text-red-600 mt-2">{errors.email}</div>
                            )}
                        </div>
                    </div>

                    {/* Files upload area: two uploaders side-by-side with separator */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <FileUploader
                                title="رفع السجل التجارى"
                                maxFiles={4}
                                formKey="filesA"
                                apiUrl={""}
                                responseKey={""}
                                disabled={mode === 'update' && !isEditing}
                            />
                        </div>

                        <div className="flex items-center">
                            <div className="w-px bg-gray-200 self-stretch" />
                        </div>

                        <div className="flex-1">
                            <FileUploader
                                title="رفع البطاقة الضريبية"
                                maxFiles={4}
                                formKey="filesB"
                                apiUrl={""}
                                responseKey={""}
                                disabled={mode === 'update' && !isEditing}
                            />
                        </div>
                    </div>

                    {/* Address details: main branch, governorate, city, postal, address details */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    name="mainBranch"
                                    placeholder="الفرع الرئيسي"
                                    value={values.mainBranch}
                                    onChange={(e) => handleChange(e)}
                                    onBlur={(e) => handleBlur(e)}
                                    className={errorClass("mainBranch")}
                                    disabled={mode === 'update' && !isEditing}
                                />
                                {errors.mainBranch && touched.mainBranch && (
                                    <div className="text-sm text-red-600 mt-2 ">{errors.mainBranch}</div>
                                )}
                            </div>

                            <div>
                                <Input
                                    name="fullName"
                                    placeholder="الاسم"
                                    value={values.fullName}
                                    onChange={(e) => handleChange(e)}
                                    onBlur={(e) => handleBlur(e)}
                                    className={errorClass("fullName")}
                                    disabled={mode === 'update' && !isEditing}
                                />
                                {errors.fullName && touched.fullName && (
                                    <div className="text-sm text-red-600 mt-2 ">{errors.fullName}</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="sr-only">المحافظة</label>
                                <Combobox
                                    options={governorates.map(g => ({ label: g.label, value: g.value }))}
                                    value={values.governorate}
                                    onChange={(v) => {
                                        if (mode === 'update' && !isEditing) return;
                                        // set governorate value (value is the id/key) and reset city
                                        setValues(prev => ({ ...prev, governorate: v, city: "" }));
                                        // mark touched so useForm knows to show validation
                                        setTouched({ ...touched, governorate: true });

                                        // validate governorate using the translated schema with the new value
                                        schemas.supplierInfoSchema
                                            .validateAt('governorate', { ...values, governorate: v, city: "" })
                                            .then(() => setErrors((prev) => ({ ...prev, governorate: "" })))
                                            .catch((err) => setErrors((prev) => ({ ...prev, governorate: err.message })));
                                    }}
                                    onBlur={(e) => handleBlur({ target: { name: 'governorate' } })}
                                    placeholder="اختر المحافظة"
                                    className={errorClass("governorate")}
                                    disabled={mode === 'update' && !isEditing}
                                />
                                {errors.governorate && touched.governorate && (
                                    <div className="text-sm text-red-600 mt-2">{errors.governorate}</div>
                                )}
                            </div>

                            <div>
                                <label className="sr-only">المدينة</label>
                                <Combobox
                                    options={cityOptions.map(c => ({ label: c.label, value: c.value }))}
                                    value={values.city}
                                    onChange={(v) => {
                                        if (mode === 'update' && !isEditing) return;
                                        // update city value
                                        setValues(prev => ({ ...prev, city: v }))
                                        // mark touched
                                        setTouched({ ...touched, city: true })
                                        // validate city using translated schema against the new value
                                        schemas.supplierInfoSchema
                                            .validateAt('city', { ...values, city: v })
                                            .then(() => setErrors((prev) => ({ ...prev, city: "" })))
                                            .catch((err) => setErrors((prev) => ({ ...prev, city: err.message })));
                                    }}
                                    onBlur={(e) => handleBlur({ target: { name: 'city' } })}
                                    placeholder={values.governorate ? "اختر المدينة" : "اختر المحافظة أولاً"}
                                    className={errorClass("city")}
                                    comboinputclass=""
                                    disabled={!values.governorate || (mode === 'update' && !isEditing)}
                                />
                                {errors.city && touched.city && (
                                    <div className="text-sm text-red-600 mt-2">{errors.city}</div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Input
                                    name="postalCode"
                                    placeholder="الرقم البريدي"
                                    value={values.postalCode}
                                    onChange={(e) => { if (mode === 'update' && !isEditing) return; handleChange(e); }}
                                    onBlur={(e) => handleBlur(e)}
                                    className={errorClass("postalCode")}
                                    disabled={mode === 'update' && !isEditing}
                                />
                                {errors.postalCode && touched.postalCode && (
                                    <div className="text-sm text-red-600 mt-2 ">{errors.postalCode}</div>
                                )}
                            </div>

                            <div>
                                <Input
                                    name="addressDetails"
                                    placeholder="تفاصيل العنوان"
                                    value={values.addressDetails}
                                    onChange={(e) => { if (mode === 'update' && !isEditing) return; handleChange(e); }}
                                    onBlur={(e) => handleBlur(e)}
                                    className={errorClass("addressDetails")}
                                    disabled={mode === 'update' && !isEditing}
                                />
                                {errors.addressDetails && touched.addressDetails && (
                                    <div className="text-sm text-red-600 mt-2 ">{errors.addressDetails}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex items-center justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" type="button" onClick={() => { if (typeof onOpenChangeProp === 'function') onOpenChangeProp(false); else setOpen(false); }}>
                                إلغاء
                            </Button>
                        </DialogClose>

                        {mode === 'update' && !isEditing ? (
                            <Button type="button" className="rounded-md bg-yellow-500 hover:bg-yellow-600 text-white" onClick={(e) => { e?.preventDefault?.(); e?.stopPropagation?.(); setIsEditing(true); }}>
                                تعديل
                            </Button>
                        ) : (
                            <Button type="submit" className={`rounded-md bg-go-primary-e hover:bg-go-primary-o `}>
                                {mode === 'update' ? 'حفظ' : 'إضافة المورد'}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
