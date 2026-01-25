"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/common/reusable-input/reusableInput'
import { useValidationI18nSchemas } from '@/hooks/useTranslatedValidation'
import useForm from '@/hooks/useForm'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import useAuth from '@/hooks/useAuth'
import { MdPassword } from 'react-icons/md'
import i18n from '@/lib/i18next/i18next'
import { FaArrowLeft } from 'react-icons/fa'

export default function Page() {
    const router = useRouter();
    const { schemas } = useValidationI18nSchemas();
    const { resetPassword, firstAllowedPath } = useAuth();
    const lang = i18n?.language || 'en';


    const initialValues = { NewPassword: '', confirmPassword: '' };

    const onSubmit = async (values) => {
        try {
            const email = (() => { try { return localStorage.getItem('forgotEmail'); } catch (e) { return null; } })();
            const resetCode = (() => { try { return localStorage.getItem('forgotResetCode'); } catch (e) { return null; } })();
            if (!email) { toast.error('Missing email'); return; }
            const result = await resetPassword(email, values.NewPassword, resetCode);
            if (result?.ok) {
                try { localStorage.removeItem('forgotEmail'); localStorage.removeItem('forgotResetCode'); } catch (e) { }
                toast.success('تم إعادة تعيين كلمة المرور');
                try {
                    const dest = (typeof firstAllowedPath === 'function') ? firstAllowedPath() : '/';
                    router.push(dest || '/');
                } catch (e) {
                    router.push('/');
                }
                return;
            }
            const err = result?.error || null;
            const message = err?.message || err?.response?.data?.message || String(err) || 'حدث خطأ';
            toast.error(message);
        } catch (err) {
            const message = err?.response?.data?.message || err?.message || String(err);
            toast.error(message);
        }
    };

    const { values, errors, touched, handleChange, handleBlur, handleSubmit } = schemas?.resetPasswordSchema
        ? useForm(initialValues, schemas.resetPasswordSchema, onSubmit)
        : { values: initialValues, errors: {}, touched: {}, handleChange: () => { }, handleBlur: () => { }, handleSubmit: () => { } };

    if (!schemas?.resetPasswordSchema) return <div>Loading...</div>;

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
                    <MdPassword className="text-go-primary-e" size={30} />
                </div>
                <div className="text-center">
                    <h1 className='font-bold text-xl'>إعادة تعيين كلمة المرور</h1>
                    <h2 className='font-semibold'>أدخل كلمة المرور الجديدة</h2>
                </div>

                <Input type="password" name="NewPassword" label={'كلمة المرور الجديدة'} placeholder={'أدخل كلمة المرور الجديدة'} value={values.NewPassword} onChange={handleChange} onBlur={handleBlur} />
                {errors.NewPassword && touched.NewPassword && <p className="text-red-500 text-sm">{errors.NewPassword}</p>}

                <Input type="password" name="confirmPassword" label={'تأكيد كلمة المرور'} placeholder={'أعد إدخال كلمة المرور'} value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur} />
                {errors.confirmPassword && touched.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}

                <Button type="submit" className="w-full bg-go-primary-e hover:bg-go-primary-o text-white py-4">إعادة التعيين</Button>
            </form>
        </div>
    )
}
