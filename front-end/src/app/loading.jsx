'use client';
import { useLottieAnimation } from '@/hooks/useLottieAnimation.js';
import loader from '../../public/assets/illustrations/Go.json'
export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90">
            <div className="flex justify-center items-center w-[40%]">
                {useLottieAnimation({
                    animationData: loader,
                    autoplay: true,
                    loop: true,
                })}
            </div>
        </div>
    );
}