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
            <div className="flex flex-col justify-center">
                <div className="content flex flex-col items-center justify-center text-center gap-6 pt-12">
                    <h1 className='text-go-primary-g text-6xl text-bold font-hacen'>{t('header.title')}</h1>
                    <h2 className='text-go-primary-g text-xl text-bold font-hacen'>{t('header.subtitle')}</h2>
                </div>
                <div className="flex flex-col items-center gap-1">

                <div className="w-1/3">
                    {useLottieAnimation({ animationData: notFound, autoplay: true, loop: true })}
                </div>
                <Button
                    className='w-1/4 text-white bg-go-primary-e hover:bg-go-primary-o rounded-md'
                    variant="primary"
                    onClick={() => router.back()}
                >
                    {t('button')}
                </Button>
                </div>
            </div>
        </div>
    </>
}

export default NotFound;