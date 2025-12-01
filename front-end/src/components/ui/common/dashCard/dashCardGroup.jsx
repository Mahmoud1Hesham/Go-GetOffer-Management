import React from 'react'
import DashCard from './dashCard'

const DashCardGroup = ({ statsConfig }) => {
    return <>
        <div className="flex gap-4 overflow-x-auto px-2 py-4 bg-gray-50 shadow-md rounded-2xl">
            {statsConfig.map((item) => (
                <DashCard key={item.id} {...item} />
            ))}
        </div>
    </>
}

export default DashCardGroup