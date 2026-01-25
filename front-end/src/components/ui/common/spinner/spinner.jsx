import React from 'react'
import spinner from '../../../../../public/assets/illustrations/Spinner.json'
import { useLottieAnimation } from '@/hooks/useLottieAnimation'
const Spinner = () => {
    return (
        <div className='w-10'>
            {useLottieAnimation({animationData:spinner,loop:true,autoplay:true})}
        </div>
    )
}

export default Spinner