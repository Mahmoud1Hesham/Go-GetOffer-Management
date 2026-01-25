"use client"
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/common/reusable-input/reusableInput'
import React, { useState } from 'react'
import { MdOutlineMail } from 'react-icons/md'
import { FaArrowLeft } from 'react-icons/fa'
import axiosRequester from '@/lib/axios/axios'
import useAuth from '@/hooks/useAuth'
import { useValidationI18nSchemas } from '@/hooks/useTranslatedValidation'
import { useRouter } from 'next/navigation'
import useForm from '@/hooks/useForm'
import { toast } from 'sonner'

const page = () => {
    const router = useRouter();
    const { schemas, t, i18n } = useValidationI18nSchemas();
    const lang = i18n?.language || 'en';
    const [serverError, setServerError] = useState(null);

    const initialValues = { email: '' };

    const { forgotPassword, isAuthenticated } = useAuth();

    const onSubmit = async (values) => {
        setServerError(null);
        try {
            const result = await forgotPassword(values.email);
            if (result?.ok) {
                try { localStorage.setItem('forgotEmail', values.email); } catch (e) { }
                console.log(result)
                toast.success('تم إرسال رابط إعادة التعيين إلى بريدك');
                router.push('/dashboard/auth/check-otp');
                return;
            }
            const err = result?.error || null;
            const message = err?.message || err?.response?.data?.message || String(err) || 'حدث خطأ';
            setServerError(message);
            toast.error(message);
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || String(err);
            setServerError(message);
            toast.error(message);
        }
    };

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = schemas?.forgetPasswordSchema
        ? useForm(initialValues, schemas.forgetPasswordSchema, onSubmit)
        : { values: initialValues, errors: {}, touched: {}, handleChange: () => { }, handleBlur: () => { }, handleSubmit: () => { } };

    if (!schemas?.forgetPasswordSchema) return <div>Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center px-4 pb-8">
            {isAuthenticated && <div className="flex justify-start w-full">
                <Button
                    type="button"
                    onClick={() => router.back()}
                    className={` h-15 w-20 group shadow-md bg-white text-black hover:bg-gray-300  px-4 rounded-lg py-3 disabled:opacity-50 flex ${lang === 'en' ? '' : 'flex-row-reverse'}`}
                >
                    <FaArrowLeft className="ml-2 transition-transform duration-300 group-hover:-translate-x-3" />
                    رجوع
                </Button>
            </div>
            }
            <form
                className="bg-white rounded-2xl px-6 py-10 w-full max-w-md flex flex-col gap-6"
                onSubmit={handleSubmit}
            >
                <div className="p-2 flex justify-center mx-auto mb-5 items-center bg-go-bg-l-e rounded-lg w-12 h-12">
                    <MdOutlineMail className="text-go-primary-e" size={30} />
                </div>
                <div className="text-center">
                    <h1 className='font-bold text-xl'>نسيت كلمة المرور</h1>
                    <h2 className='font-semibold'>أدخل بريدك الإلكتروني لاستعادة حسابك</h2>
                </div>

                <div className="relative">
                    <Input
                        type="text"
                        name="email"
                        label='البريد الإلكتروني'
                        placeholder='أدخل بريدك الإلكتروني'
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className=""
                    />
                </div>
                {errors.email && touched.email && (
                    <p className="text-red-500 text-sm">{errors.email}</p>
                )}

                {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

                <Button
                    type="submit"
                    className="w-full  bg-go-primary-e hover:bg-go-primary-o text-white  px-4 rounded-lg py-6 disabled:opacity-50"
                >
                    متابعة
                </Button>
            </form>
        </div>
    )
}

export default page
