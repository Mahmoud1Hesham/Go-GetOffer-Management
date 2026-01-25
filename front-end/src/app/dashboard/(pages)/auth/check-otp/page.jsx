"use client"
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import OTPInput from '@/components/ui/common/otp/otpInput'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import useAuth from '@/hooks/useAuth'
import { FaRegEnvelopeOpen } from "react-icons/fa6";
import i18n from '@/lib/i18next/i18next'
import { FaArrowLeft } from 'react-icons/fa'
import { useValidationI18nSchemas } from '@/hooks/useTranslatedValidation'
import useForm from '@/hooks/useForm'

export default function Page() {
    const router = useRouter();
    const { verifyPasswordOtp } = useAuth();
    const { schemas } = useValidationI18nSchemas();
    const initialValues = { Otp: '' };
    const [serverError, setServerError] = useState(null);
    const [email, setEmail] = useState(null);
        const lang = i18n?.language || 'en';


    useEffect(() => {
        try { const e = localStorage.getItem('forgotEmail'); setEmail(e); } catch (e) { setEmail(null); }
    }, []);

    const onSubmit = async (vals) => {
        setServerError(null);
        if (!email) {
            setServerError('Missing email. Please restart the flow.');
            return;
        }
            try {
            const otp = (vals && vals.Otp) || values.Otp;
            console.log('verifyPasswordOtp payload', { email, otp });
            const result = await verifyPasswordOtp(email, otp);
            if (result?.ok) {
                try { localStorage.setItem('forgotResetCode', otp); } catch (e) {}
                toast.success('رمز التحقق تم التحقق بنجاح');
                router.push('/dashboard/auth/reset-password');
                return;
            }
            const err = result?.error || null;
            const message = err?.message || err?.response?.data?.message || String(err) || 'رمز غير صالح';
            setServerError(message);
            toast.error(message);
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || String(err);
            setServerError(message);
            toast.error(message);
        }
    };

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = schemas?.forgetPasswordOtpVerification
        ? useForm(initialValues, schemas.forgetPasswordOtpVerification, onSubmit)
        : { values: initialValues, errors: {}, touched: {}, handleChange: () => {}, handleBlur: () => {}, handleSubmit: () => {} };

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

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl px-6 py-10 w-full max-w-md flex flex-col gap-6">
                <div className="p-2 flex justify-center mx-auto mb-5 items-center bg-go-bg-l-e rounded-lg w-12 h-12">
                    <FaRegEnvelopeOpen className="text-go-primary-e" size={30} />
                </div>

                <div className="text-center">
                    <h1 className='font-bold text-xl'>التحقق من رمز التفعيل</h1>
                    <h2 className='font-semibold'>أدخل رمز التحقق المرسل إلى بريدك</h2>
                </div>

                <div className="flex justify-center">
                    <OTPInput length={6} value={values.Otp} onChange={(val) => handleChange({ target: { name: 'Otp', value: val } })} />
                </div>

                {errors.Otp && touched.Otp && <p className="text-red-500 text-sm">{errors.Otp}</p>}

                {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

                <Button type="submit" className="w-full bg-go-primary-e hover:bg-go-primary-o text-white py-4">متابعة</Button>
            </form>
        </div>
    )
}
