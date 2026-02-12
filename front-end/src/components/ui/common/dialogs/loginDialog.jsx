'use client'

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import useForm from '@/hooks/useForm'
import { loginSchema } from '@/app/Validation/ValidationSchemas.js'
import { useSearchParams, useRouter } from 'next/navigation'
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
import { useModal } from '@/hooks/useModal';
import { getPermissionMaps } from '@/app/services/auth/permissionMaps.js';
import { getPathsForRole } from '@/app/services/maps/appPathsStructure.map.js';
import { mapUserRole } from '@/app/services/workers/userRoleMapper.js';
import { useValidationI18nSchemas } from '@/hooks/useTranslatedValidation'

export default function LoginDialog() {
    const router = useRouter();
    const { login, loginStatus } = useAuth(); // login returns { ok, data?, error? }
    const { closeModal } = useModal();
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated)
    const searchParams = useSearchParams()
    const lang = searchParams?.get('lang') || 'ar';
    const { schemas } = useValidationI18nSchemas();

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

            // success: useAuth should have dispatched setCredentials; compute allowed path from returned user
            try {
                const serverUser = res?.data?.user || null;
                // reuse centralized mapper so mapping logic stays in one place
                const mappedUser = serverUser ? mapUserRole(serverUser) : null;

                const pm = getPermissionMaps();
                let target = '/';
                const candidates = [
                    mappedUser?.roleId,
                    mappedUser?.role,
                    mappedUser?.roleKey,
                    mappedUser?.role?.roleKey,
                    mappedUser?.role?.id,
                ].filter(Boolean).map(String);

                for (const rid of candidates) {
                    const set = pm?.roleToPaths?.get(rid);
                    if (set && set.size > 0) {
                        const arr = Array.from(set);
                        target = arr.includes('/') ? '/' : arr[0];
                        break;
                    }
                    const paths = getPathsForRole(rid) || [];
                    if (paths && paths.length > 0) {
                        target = paths.includes('/') ? '/' : paths[0];
                        break;
                    }
                }

                console.debug('[LoginDialog] redirecting to', target, 'for user', mappedUser);
                // close any global modal that may be open (e.g., NotAuthorized)
                try { closeModal(); } catch (e) { }
                // give React/Redux a brief tick to process modal close/unmounts
                try {
                    setTimeout(() => {
                        try { router.push(target); } catch (e) { console.warn('router.push failed', e); }
                    }, 40);
                } catch (e) {
                    router.push(target);
                }
            } catch (e) {
                console.warn('[LoginDialog] redirect failed', e);
            }
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
    } = useForm(initialValues, schemas.loginSchema, onSubmit)

    // Dialog open controlled by a local state ( synced to auth ) so we can close it programmatically
    const [dialogOpen, setDialogOpen] = useState(!isAuthenticated);
    useEffect(() => { setDialogOpen(!isAuthenticated); }, [isAuthenticated]);

    return (
        <Dialog open={dialogOpen} onOpenChange={() => { /* منع الإغلاق اليدوي */ }}>
            <DialogContent className="max-w-md">
                <DialogHeader className={'text-center'}>
                    <DialogTitle>{lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}</DialogTitle>
                    <DialogDescription>
                        {lang === 'en' ? 'Enter your email and password to continue.' : 'ادخل الايميل وكلمة المرور للمتابعة.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4" noValidate>
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
                            disabled={loginStatus?.isLoading}
                            aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                            aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                        />

                        <span
                            className='text-go-primary-g mt-2 hover:text-go-primary-o transition-all duration-300 cursor-pointer'
                            onClick={() => {
                                try { closeModal(); } catch (e) { }
                                try { setDialogOpen(false); } catch (e) { }
                                try {
                                    setTimeout(() => { router.push('/dashboard/auth/forgot-password'); }, 40);
                                } catch (e) {
                                    router.push('/dashboard/auth/forgot-password');
                                }
                            }}
                        >{lang === 'en' ? 'Forgot password?' : 'هل نسيت كلمة المرور؟'}</span>
                        {errors.email && touched.email && <p id="email-error" className="text-sm mt-1 text-red-500">{errors.email}</p>}
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
                            disabled={loginStatus?.isLoading}
                            aria-invalid={errors.passwordHash && touched.passwordHash ? 'true' : 'false'}
                            aria-describedby={errors.passwordHash && touched.passwordHash ? 'password-error' : undefined}
                        />
                        {errors.passwordHash && touched.passwordHash && <p id="password-error" className="text-sm text-red-500">{errors.passwordHash}</p>}
                    </div>

                    {serverError && <p className="text-sm text-red-600">{serverError}</p>}

                    <DialogFooter className="pt-2 flex sm:justify-start">
                        <Button className='bg-go-primary-e hover:bg-go-primary-o' type="submit" disabled={loginStatus?.isLoading}>
                            {loginStatus?.isLoading ? (lang === 'en' ? 'Signing...' : 'جاري الدخول...') : (lang === 'en' ? 'Sign In' : 'تسجيل الدخول')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
