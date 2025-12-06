"use client"

import React, { useMemo, useState } from "react"
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
import { Button } from "@/components/ui/button"
import useForm from "@/hooks/useForm"
import { useValidationI18nSchemas } from "@/hooks/useTranslatedValidation"
export default function CreateSupplierDialog({ triggerNode = null }) {
    const [open, setOpen] = useState(false)

    const errorClass = (field) =>
        errors[field] && touched[field] ? "border-red-600 ring-1 ring-red-600 rounded-md" : ""

    // useForm for validation and state
    const initialValues = {
        companyName: "",
        fullName: "",
        phoneNumbers: [""],
        email: "",
        activities: ["cleaning supplies"],
        governorate: "",
        city: "",
        mainBranch: "",
        postalCode: "",
        addressDetails: "",
    }

    const onSubmit = (values) => {
        console.log("CreateSupplier payload (validated):", values)
        setOpen(false)
    }
    const { schemas } = useValidationI18nSchemas();

    const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setErrors, setTouched } = useForm(
        initialValues,
        schemas.supplierInfoSchema,
        onSubmit
    )

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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* If a `triggerNode` is provided by a parent (e.g. header), use it as the Dialog trigger via `asChild`. */}
            {triggerNode ? (
                <DialogTrigger asChild>{triggerNode}</DialogTrigger>
            ) : (
                <DialogTrigger asChild>
                    <Button variant="default">إضافة المورد</Button>
                </DialogTrigger>
            )}

            <DialogContent className="max-w-4xl supplier-dialog">
                <style>{`.supplier-dialog .absolute.right-4.top-4{ right: auto; left: 1rem; }`}</style>
                <DialogHeader className="flex items-start justify-between">
                    <DialogTitle className="ml-auto text-right">إضافة مورد جديد</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4">
                    {/* Top row: name and phone */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Input
                                name="companyName"
                                placeholder="اسم الكيان"
                                value={values.companyName}
                                onChange={(e) => handleChange(e)}
                                onBlur={(e) => handleBlur(e)}
                                className={errorClass("companyName")}
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
                                    const v = e.target.value
                                    setValues({ ...values, phoneNumbers: [v] })
                                }}
                                onBlur={(e) => handleBlur({ target: { name: "phoneNumbers" } })}
                                className={errorClass("phoneNumbers")}
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
                                onChange={(e) => handleChange(e)}
                                onBlur={(e) => handleBlur(e)}
                                className={errorClass("email")}
                            />
                            {errors.email && touched.email && (
                                <div className="text-sm text-red-600 mt-2">{errors.email}</div>
                            )}
                        </div>
                    </div>

                    {/* Files area placeholder (could be replaced with upload component) */}
                    <div className="border-dashed border-2 border-gray-300 rounded-md p-8 text-center">
                        <div className="text-muted-foreground">اسحب الملفات هنا أو تصفح للرفع</div>
                        <div className="text-sm text-gray-500 mt-2">jpg, png, jpeg, pdf</div>
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
                                    disabled={!values.governorate}
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
                                    onChange={(e) => handleChange(e)}
                                    onBlur={(e) => handleBlur(e)}
                                    className={errorClass("postalCode")}
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
                                    onChange={(e) => handleChange(e)}
                                    onBlur={(e) => handleBlur(e)}
                                    className={errorClass("addressDetails")}
                                />
                                {errors.addressDetails && touched.addressDetails && (
                                    <div className="text-sm text-red-600 mt-2 ">{errors.addressDetails}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-4 flex items-center justify-end gap-2">
                        <DialogClose asChild>
                            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                                إلغاء
                            </Button>
                        </DialogClose>

                        <DialogClose asChild>
                            <Button type="button" className={`rounded-md bg-go-primary-e hover:bg-go-primary-o `} onClick={handleSubmit}>
                                إضافة المورد
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
