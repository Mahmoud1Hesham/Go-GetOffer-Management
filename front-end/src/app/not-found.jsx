'use client'
import { useLottieAnimation } from '@/hooks/useLottieAnimation';
import React from 'react'
import { useTranslation } from 'react-i18next';
import notFound from '../../public/assets/illustrations/Rejection.json'
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const NotFound = () => {
    const { t } = useTranslation(["notFound"]);
    const router = useRouter();

    return <>
        <div className="">
            <div className="container">
                <div className="content flex flex-col items-center text-center gap-6">
                    <h1>{t('header.title')}</h1>
                    <h2>{t('header.subtitle')}</h2>
                </div>
                <div className="flex flex-col gap-6 relative">

                <div className="h-64 absolute">
                    {useLottieAnimation({ animationData: notFound, autoplay: true, loop: true })}
                </div>
                <Button
                    className='w-auto text-white bg-go-primary-e hover:bg-go-primary-o rounded-md absolute z-50 bottom-5'
                    variant="primary"
                    onClick={() => router.push('/')}
                >
                    {t('button')}
                </Button>
                </div>
            </div>
        </div>
    </>
}

export default NotFound;