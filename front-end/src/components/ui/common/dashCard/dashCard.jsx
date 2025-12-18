import React from 'react';
export default function DashCard({
    title,
    value,
    unit,
    note,
    icon: Icon,
    iconBg,
    iconColor,
}) {
    return (
        <div className="flex flex-1 flex-col justify-center rounded-[32px] border bg-white px-4 py-2 shadow-md min-w-[230px]">
            <div className="flex gap-5 items-center justify-between">
                {/* value */}
                <div className="">
                    <span className="text-xs text-slate-500">{title}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="text-3xl font-semibold">{value}</div>
                        {unit && <div className="text-3xl mb-2 ">{unit}</div>}
                    </div>
                </div>
                {/* icon + title */}
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
                    {Icon && <Icon className="w-6 h-6" />}
                </div>
            </div>


            {/* note  */}
            {note && (
                <div className="text-[11px] mt-2">
                    {note}
                </div>
            )}
        </div>
    );
}
