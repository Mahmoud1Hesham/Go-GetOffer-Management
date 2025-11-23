import React from 'react'
import spinner from '@/assets/illustrations/spinner.json'
import { useLottieAnimation } from '@/hooks/useLottieAnimation'
const Spinner = () => {
    return (
        <div className='w-10'>
            {useLottieAnimation({animationData:spinner,loop:true,autoplay:true})}
        </div>
    )
}

export default Spinner