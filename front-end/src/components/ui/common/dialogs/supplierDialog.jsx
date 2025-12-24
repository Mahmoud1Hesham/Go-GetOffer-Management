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
import MultiSelectInput, { activities } from "@/components/ui/common/multi-select-input/multiSelectInput"
import { useSearchParams } from "next/navigation"
import axios from '@/lib/axios/axios'
import { Combobox } from "@/components/ui/common/combo-box/comboBox"
import FileUploader from "@/components/ui/common/file-uploader/fileUploader"
import { Button } from "@/components/ui/button"
import useForm from "@/hooks/useForm"
import { useValidationI18nSchemas } from "@/hooks/useTranslatedValidation"
import { useMutationFetch } from '@/hooks/useQueryFetch'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSuppliers, selectSupplierById } from '@/redux/slices/supplierManagementSlice'
import { toast } from "sonner"
import { normalizeErrors } from "@/app/services/errorNormalizer"
import { getErrorMessage } from "@/app/services/errorHandler"
export default function SupplierDialog({ triggerNode = null, mode = 'create', initialData = null, onCreate = null, onUpdate = null, open: openProp = undefined, onOpenChange: onOpenChangeProp = null }) {
    const [open, setOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(mode === 'create');

    const errorClass = (field) =>
        errors[field] && touched[field] ? "border-red-600 ring-1 ring-red-600 rounded-md" : ""

    // useForm for validation and state
    const initialValues = {
        companyName: "",
        fullName: "",
        phoneNumber: "",
        email: "",
        activities: [],
        governorate: "",
        city: "",
        filesA: [],
        filesB: [],
        mainBranch: "",
        postalCode: "",
        addressDetails: "",
    }

    const onSubmit = (values) => {
        // create mode: build JSON payload (API expects application/json in headers)
        const gov = governorates.find((gg) => gg.value === values.governorate)
        const govLabel = gov ? gov.label : values.governorate || ""
        const cOpt = (Array.isArray(cityOptions) ? cityOptions : []).find((cc) => cc.value === values.city)
        const cityLabel = cOpt ? cOpt.label : values.city || ""

        // build FormData for multipart upload
        const formData = new FormData()

        // debug: ensure uploader values are present
        try {
            // eslint-disable-next-line no-console
            console.debug('SupplierDialog onSubmit - filesA:', values.filesA)
            // eslint-disable-next-line no-console
            console.debug('SupplierDialog onSubmit - filesB:', values.filesB)
        } catch (e) { /** ignore */ }

        formData.append('Email', values.email ?? "")
        const phoneArr = Array.isArray(values.phoneNumbers) ? values.phoneNumbers : (values.phoneNumbers ? [values.phoneNumbers] : [])
        formData.append('PhoneNumber', phoneArr[0] ?? "")
        formData.append('CompanyName', values.companyName ?? "")
        formData.append('FullName', values.fullName ?? "")
        formData.append('BranchName', values.mainBranch ?? "")
        formData.append('Governorate', govLabel)
        // Normalize GovernorateId: accept either the id (value) or the displayed label
        let govId = values.governorate
        if (govId) {
            const foundByValue = governorates.find((g) => g.value === govId)
            if (!foundByValue) {
                const foundByLabel = governorates.find((g) => String(g.label) === String(govId))
                if (foundByLabel) govId = foundByLabel.value
            }
        }
        if (govId) formData.append('GovernorateId', govId)

        // Normalize CityId: search current `cityOptions` (loaded from server) for value or label
        let cityId = values.city
        if (cityId) {
            const allCities = Array.isArray(cityOptions) ? cityOptions : []
            const foundByValue = allCities.find((c) => String(c.value) === String(cityId))
            if (!foundByValue) {
                const foundByLabel = allCities.find((c) => String(c.label) === String(cityId))
                if (foundByLabel) cityId = foundByLabel.value
            }
        }
        if (cityId) formData.append('CityId', cityId)
        formData.append('City', cityLabel)
        formData.append('AddressDetails', values.addressDetails ?? "")
        formData.append('PostalCode', values.postalCode ?? "")

        const activitiesArr = Array.isArray(values.activities) ? values.activities : (values.activities ? [values.activities] : [])
        activitiesArr.forEach((a) => formData.append('ActivityType[]', a))
        phoneArr.forEach((p) => formData.append('PhoneNumbers[]', p))

        const attachFiles = (list, key) => {
            if (!list) return 0
            let appended = 0
            list.forEach((f) => {
                let fileObj = null
                if (f instanceof File || f instanceof Blob) fileObj = f
                else if (f && (f.file instanceof File || f.file instanceof Blob)) fileObj = f.file
                else if (f && (f.rawFile instanceof File || f.rawFile instanceof Blob)) fileObj = f.rawFile
                else if (typeof f === 'string') fileObj = f
                else if (f && typeof f.uploadedUrl === 'string') fileObj = f.uploadedUrl

                if (fileObj !== null && typeof fileObj !== 'undefined') {
                    try {
                        formData.append(key, fileObj)
                        appended += 1
                    } catch (e) {
                        // eslint-disable-next-line no-console
                        console.error('Failed to append file for', key, e)
                    }
                }
            })
            // eslint-disable-next-line no-console
            console.debug(`attachFiles(${key}) appended=${appended}`)
            return appended
        }

        attachFiles(values.filesA, 'CommercialRegistrationDocuments')
        attachFiles(values.filesB, 'TaxCardDocuments')

        if (mode === 'update') {
            const id = values.id || (initialData && (initialData.id || initialData.supplierId));
            if (id) formData.append('Id', id);

            updateMutation.mutate({ data: formData, config: { headers: { 'Content-Type': 'multipart/form-data' } } }, {
                onSuccess: (data) => {
                    try { dispatch(fetchSuppliers()) } catch (e) { /* ignore */ }
                    if (typeof onUpdate === 'function') onUpdate(data);
                    if (typeof onOpenChangeProp === 'function') onOpenChangeProp(false);
                    else setOpen(false);
                    setIsEditing(mode === 'create');
                    toast.success('تم تعديل المورد بنجاح')
                }
            })
        } else {
            // Pass request as { data: formData, config: { headers: { 'Content-Type': 'multipart/form-data' } } }
            mutation.mutate({ data: formData, config: { headers: { 'Content-Type': 'multipart/form-data' } } }, {
                onSuccess: (data) => {
                    // refresh suppliers list from server
                    try { dispatch(fetchSuppliers()) } catch (e) { /* ignore */ }
                    if (typeof onCreate === 'function') onCreate(data);
                    if (typeof onOpenChangeProp === 'function') onOpenChangeProp(false);
                    else setOpen(false);
                    setIsEditing(mode === 'create');
                    console.log('supplier created successfully !')
                    toast.success('تم إنشاء المورد بنجاح')
                },
                onError: (err) => {
                    console.error('Create supplier failed', err)

                    try {
                        const normalized = normalizeErrors(err)
                        if (normalized && Object.keys(normalized).length && typeof setErrors === 'function') {
                            setErrors((prev) => ({ ...prev, ...normalized }))
                        }
                    } catch (e) {
                        console.error('error normalizing create supplier error', e)
                    }

                    try { toast.error(getErrorMessage(err)) } catch (e) { toast.error('حدث خطأ ما') }
                }
            })
        }
    }
                const { schemas } = useValidationI18nSchemas();

                const { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues, setErrors, setTouched } = useForm(
                    initialValues,
                    schemas.supplierInfoSchema,
                    onSubmit
                )

                const dispatch = useDispatch()

                // POST new supplier using useMutationFetch
                const mutation = useMutationFetch({
                    url: '/api/supplierprofile/newsupplier',
                    options: { method: 'POST' },
                    mutationOptions: {
                        onError: (err) => {
                            console.error('mutation error', err)

                            // try to normalize field errors and apply them to the form
                            try {
                                const normalized = normalizeErrors(err)
                                if (normalized && Object.keys(normalized).length && typeof setErrors === 'function') {
                                    setErrors((prev) => ({ ...prev, ...normalized }))
                                }
                            } catch (e) {
                                console.error('error normalizing mutation error', e)
                            }

                            // show friendly single-line message
                            try { toast.error(getErrorMessage(err)) } catch (e) { toast.error('حدث خطأ ما') }
                        }
                    }
                })

                // PUT update supplier
                const updateMutation = useMutationFetch({
                    url: '/api/SupplierProfile/editsupplier',
                    options: { method: 'PUT' },
                    mutationOptions: {
                        onError: (err) => {
                            console.error('update mutation error', err)
                            try {
                                const normalized = normalizeErrors(err)
                                if (normalized && Object.keys(normalized).length && typeof setErrors === 'function') {
                                    setErrors((prev) => ({ ...prev, ...normalized }))
                                }
                            } catch (e) {
                                console.error('error normalizing update error', e)
                            }
                            try { toast.error(getErrorMessage(err)) } catch (e) { toast.error('حدث خطأ ما') }
                        }
                    }
                })

                // Helper to map incoming initialData to form shape
                function mapInitial(data) {
                    if (!data) return initialValues;

                    // Support both raw API shape and the mapped supplier object from the slice.
                    // The slice maps `profile.activityType` -> `categories` and branch -> `branchName`.
                    return {
                        id: data.id ?? data.supplierId ?? null,
                        companyName: data.companyName ?? data.name ?? "",
                        fullName: data.fullName ?? "",
                        phoneNumbers: data.phoneNumbers ?? (data.phone ? [data.phone] : [""]),
                        email: data.email ?? "",
                        // activities can come as `activities`, `activityType`, or `categories` (from slice)
                        activities: data.activities ?? data.activityType ?? data.categories ?? [],
                        // prefer id fields when provided so the Combobox control holds the value (id)
                        governorate: data.governorateId ?? data.governorate ?? "",
                        city: data.cityId ?? data.city ?? "",
                        filesA: data.commercialRegistrationDocumentUrl ? (Array.isArray(data.commercialRegistrationDocumentUrl) ? data.commercialRegistrationDocumentUrl : []) : (data.commercialRegistrationDocumentUrl ?? []),
                        filesB: data.taxCardDocumentUrl ? (Array.isArray(data.taxCardDocumentUrl) ? data.taxCardDocumentUrl : []) : (data.taxCardDocumentUrl ?? []),
                        mainBranch: data.mainBranch ?? data.branch ?? data.branchName ?? "",
                        postalCode: data.postalCode ?? "",
                        addressDetails: data.addressDetails ?? data.address ?? "",
                    };
                }

                const searchParams = useSearchParams()
                const lang = searchParams.get("lang") || (typeof i18n !== "undefined" ? i18n.language : "en") || "en"
                const activityOptions = lang === "en" ? activities[0].en : activities[1].ar

                // governorates and city options are loaded from server
                const [governorates, setGovernorates] = React.useState([])
                const [cityOptions, setCityOptions] = React.useState([])
                // read supplier from store (if available) to avoid unnecessary API calls when viewing
                const supplierFromStore = useSelector(selectSupplierById(initialData?.id ?? initialData?.supplierId ?? null))

                // load governorates on mount
                useEffect(() => {
                    let mounted = true
                    axios.get('/api/Governorate')
                        .then((res) => {
                            const items = res?.data?.data ?? res?.data ?? []
                            if (!mounted) return
                            const mapped = Array.isArray(items)
                                ? items.map((it) => {
                                    if (it.value !== undefined && it.label !== undefined) return { label: it.label, value: it.value }
                                    // common shapes: { id / Id, name } or { id, title }
                                    const val = it.id ?? it.Id ?? it.value ?? it.key
                                    const label = it.name ?? it.title ?? it.label ?? String(it)
                                    return { label, value: val }
                                })
                                : []
                            setGovernorates(mapped)
                        })
                        .catch((e) => {
                            console.error('Failed to load governorates', e)
                        })
                    return () => { mounted = false }
                }, [])

                // when governorate changes, fetch cities for that governorate
                useEffect(() => {
                    let mounted = true
                    async function loadCities() {
                        const selected = values.governorate
                        if (!selected) {
                            setCityOptions([])
                            return
                        }

                        // determine governorate id if value may be a label
                        let govId = selected
                        const foundByValue = governorates.find((g) => g.value === selected)
                        if (!foundByValue) {
                            const foundByLabel = governorates.find((g) => String(g.label) === String(selected))
                            if (foundByLabel) govId = foundByLabel.value
                        }

                        try {
                            // API expects { Id: <governorateId> }
                            const res = await axios.post('/api/city/gov', { Id: govId })
                            const items = res?.data?.data ?? res?.data ?? []
                            if (!mounted) return
                            const mapped = Array.isArray(items)
                                ? items.map((it) => {
                                    if (it.value !== undefined && it.label !== undefined) return { label: it.label, value: it.value }
                                    // prefer id/Id, then value, then key
                                    const val = it.id ?? it.Id ?? it.value ?? it.key
                                    const label = it.name ?? it.title ?? it.label ?? String(it)
                                    return { label, value: val }
                                })
                                : []
                            setCityOptions(mapped)
                        } catch (err) {
                            console.error('Failed to load cities for governorate', govId, err)
                            setCityOptions([])
                        }
                    }
                    loadCities()
                    return () => { mounted = false }
                }, [values.governorate, governorates])

                // local submit uses useForm's handleSubmit

                // When dialog opens in update mode, prefill values and disable editing
                const handleOpenChange = (v) => {
                    setOpen(v);
                    if (v) {
                        if (mode === 'update') {
                            // Prefill full form from store if available (avoids extra API calls), otherwise use incoming initialData
                            const source = supplierFromStore || initialData || {}
                            setValues(mapInitial(source))
                            // if store provided a city, expose it in cityOptions so Combobox displays it without fetching
                            const cityVal = supplierFromStore ? (supplierFromStore.cityId ?? supplierFromStore.city) : (initialData?.cityId ?? initialData?.city)
                            const cityLabel = supplierFromStore ? (supplierFromStore.city ?? "") : (initialData?.city ?? "")
                            if (cityVal) setCityOptions([{ label: cityLabel, value: cityVal }])
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
                                            autoUpload={false}
                                            onFilesChange={(files) => setValues(prev => ({ ...prev, filesA: files }))}
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
                                            autoUpload={false}
                                            onFilesChange={(files) => setValues(prev => ({ ...prev, filesB: files }))}
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
                                        <Button type="button" className="rounded-md bg-yellow-500 hover:bg-yellow-600 text-white" onClick={(e) => { e?.preventDefault?.(); e?.stopPropagation?.();
                                            // populate fields from store or initialData, then enable editing
                                            setValues(mapInitial(supplierFromStore || initialData));
                                            setErrors({});
                                            setTouched({});
                                            setIsEditing(true);
                                        }}>
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
