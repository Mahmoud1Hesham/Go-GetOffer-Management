"use client"
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/common/reusable-input/reusableInput'
import React, { useState } from 'react'
import { MdPassword } from 'react-icons/md'
import { FaArrowLeft } from 'react-icons/fa'
import axiosRequester from '@/lib/axios/axios'
import { useValidationI18nSchemas } from '@/hooks/useTranslatedValidation'
import { useRouter } from 'next/navigation'
import useForm from '@/hooks/useForm'
import { toast } from 'sonner'
import useAuth from '@/hooks/useAuth'

const page = () => {
    const router = useRouter();
    const { schemas, t, i18n } = useValidationI18nSchemas();
    const lang = i18n?.language || 'en';
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState(null);

    const initialValues = {
        OldPassword: '',
        NewPassword: '',
        confirmPassword: ''
    };

    const { changePassword, logout } = useAuth();

    const onSubmit = async (values) => {
        setServerError(null);
        try {
            const result = await changePassword(values.OldPassword, values.NewPassword, values.confirmPassword);
            if (result?.ok) {
                toast.success('تم تغيير كلمة المرور بنجاح');
                logout();
                return;
            }
            // mutation returned error
            const err = result?.error || result?.data || null;
            const message = err?.message || err?.response?.data?.message || String(err) || t('messages.passwordChangedError') || 'حدث خطأ';
            setServerError(message);
            toast.error(message);
        } catch (err) {
            const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || String(err);
            setServerError(message);
            toast.error(message);
        }
    };

    // Check if schema is loaded before calling useForm
    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = schemas?.changePasswordSchema
        ? useForm(initialValues, schemas.changePasswordSchema, onSubmit)
        : { values: initialValues, errors: {}, touched: {}, handleChange: () => { }, handleBlur: () => { }, handleSubmit: () => { } };

    if (!schemas?.changePasswordSchema) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center px-4 pb-8">
            <div className="flex justify-start w-full">
                <Button
                    type="button"
                    onClick={() => router.back()}
                    className={` h-15 w-20 group shadow-md bg-white text-black hover:bg-gray-300  px-4 rounded-lg py-3 disabled:opacity-50 flex ${lang === 'en' ? '' : 'flex-row-reverse'}`}
                >
                    <FaArrowLeft className="ml-2 transition-transform duration-300 group-hover:-translate-x-3" />
                    رجوع
                </Button>
            </div>
            <form
                className="bg-white rounded-2xl px-6 py-10 w-full max-w-md flex flex-col gap-6"
                onSubmit={handleSubmit}
            >
                <div className="p-2 flex justify-center mx-auto mb-5 items-center bg-go-bg-l-e rounded-lg w-12 h-12">
                    <MdPassword className="text-go-primary-e" size={30} />
                </div>
                <div className="text-center">
                    <h1 className='font-bold text-xl'>تغيير كلمة المرور</h1>
                    <h2 className='font-semibold'>قم بتحديث كلمة المرور للحفاظ على أمان حسابك</h2>
                </div>

                {/* Old Password */}
                <div className="relative">
                    <Input
                        type={showOldPassword ? "text" : "password"}
                        name="OldPassword"
                        label={"كلمة المرور الحالية"}
                        placeholder={"أدخل كلمة المرور الحالية"}
                        value={values.OldPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className=""
                    />
                </div>
                <span className='text-go-primary-g hover:text-go-primary-o transition-all duration-300 cursor-pointer' onClick={() => router.push('/dashboard/auth/forgot-password')}>هل نسيت كلمة المرور؟</span>
                {errors.OldPassword && touched.OldPassword && (
                    <p className="text-red-500 text-sm">{errors.OldPassword}</p>
                )}

                {/* New Password with toggler */}
                <div className="relative">
                    <Input
                        type={showNewPassword ? "text" : "password"}
                        name="NewPassword"
                        label={"كلمة المرور الجديدة"}
                        placeholder={"أدخل كلمة المرور الجديدة"}
                        value={values.NewPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className=""
                    />
                </div>
                {errors.NewPassword && touched.NewPassword && (
                    <p className="text-red-500 text-sm">{errors.NewPassword}</p>
                )}

                {/* Confirm Password with toggler */}
                <div className="relative">
                    <Input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        label={"تأكيد كلمة المرور الجديدة"}
                        placeholder={"أدخل كلمة المرور الجديدة"}
                        value={values.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className=""
                    />
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                    <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
                )}

                {/* General server error */}
                {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

                {/* Submit */}
                <Button
                    type="submit"
                    className="w-full  bg-go-primary-e hover:bg-go-background-d-e text-white  px-4 rounded-lg py-6 disabled:opacity-50"
                >
                    تغيير كلمة المرور
                </Button>
            </form>
        </div>

    )
}

export default page