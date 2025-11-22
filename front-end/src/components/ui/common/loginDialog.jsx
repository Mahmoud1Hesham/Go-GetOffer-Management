'use client'

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import useForm from '@/hooks/useForm'
import { loginSchema } from '@/app/Validation/ValidationSchemas.js'
import { useSearchParams } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useAuth from '@/hooks/useAuth.js'

export default function LoginDialog() {
    const { login, loginStatus } = useAuth(); // login returns { ok, data?, error? }
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
    const searchParams = useSearchParams()
    const lang = searchParams?.get('lang') || 'en'

    // server / generic error
    const [serverError, setServerError] = useState('')

    // NOTE: use passwordHash as the field name (matches your API & validation)
    const initialValues = { email: '', passwordHash: '' }

    // keep setErrors available from the hook so we can set field errors returned from backend
    const onSubmit = async (values) => {
        setServerError('')
        // clear previous field errors
        setErrors?.({})

        try {
            // call login (await mutateAsync wrapper)
            const res = await login(values) // values = { email, passwordHash }

            if (!res.ok) {
                const err = res.error || {}
                const msg = err?.message || (lang === 'en' ? 'Login failed' : 'فشل تسجيل الدخول')

                // backend might return structured field errors: { email: '...', passwordHash: '...' }
                if (err?.errors && typeof err.errors === 'object') {
                    setErrors?.(err.errors)
                } else {
                    // heuristic: attach to a field if message mentions it
                    if (msg.toLowerCase().includes('email')) setErrors?.({ email: msg })
                    else if (msg.toLowerCase().includes('password')) setErrors?.({ passwordHash: msg })
                    else setServerError(msg)
                }
                return false
            }

            // success: useAuth should have dispatched setCredentials; RouteGuard will react and continue
            return true
        } catch (err) {
            const msg = err?.message || (lang === 'en' ? 'Network error' : 'خطأ في الشبكة')
            setServerError(msg)
            return false
        }
    }

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        resetForm,
        setErrors,
    } = useForm(initialValues, loginSchema, onSubmit)

    // Dialog open controlled by auth state:
    const open = !isAuthenticated

    return (
        <Dialog open={open} onOpenChange={() => { /* منع الإغلاق اليدوي */ }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}</DialogTitle>
                    <DialogDescription>
                        {lang === 'en' ? 'Enter your email and password to continue.' : 'ادخل الايميل وكلمة المرور للمتابعة.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4" noValidate>
                    <div>
                        <Label htmlFor="email">{lang === 'en' ? 'Email' : 'الإيميل'}</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            autoFocus
                            aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                        />
                        {errors.email && touched.email && <p className="text-sm text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <Label htmlFor="passwordHash">{lang === 'en' ? 'Password' : 'كلمة السر'}</Label>
                        <Input
                            id="passwordHash"
                            name="passwordHash"
                            type="password"
                            value={values.passwordHash}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            aria-invalid={errors.passwordHash && touched.passwordHash ? 'true' : 'false'}
                        />
                        {errors.passwordHash && touched.passwordHash && <p className="text-sm text-red-500">{errors.passwordHash}</p>}
                    </div>

                    {serverError && <p className="text-sm text-red-600">{serverError}</p>}

                    <DialogFooter className="pt-2">
                        <Button type="submit" disabled={loginStatus?.isLoading}>
                            {loginStatus?.isLoading ? (lang === 'en' ? 'Signing...' : 'جاري الدخول...') : (lang === 'en' ? 'Sign In' : 'دخول')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
