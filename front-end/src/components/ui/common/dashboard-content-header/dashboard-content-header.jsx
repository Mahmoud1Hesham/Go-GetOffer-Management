"use client";

import React from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IoFilter } from "react-icons/io5";
import { GoColumns } from "react-icons/go";

export default function DashboardContentHeader({
    title = "",
    createButtonTitle,
    searchPlaceholder = "ابحث...",
    apiFilter1,
    apiFilter2,
    apiCreate,
    onSearch,
}) {
    return (
        <div className="w-full px-5 mt-3">
            {/* title */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">{title}</h1>
            </div>

            {/* actions row */}
            <div className="flex justify-between items-center gap-32 flex-wrap">
                {/* search input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        className="pl-10 outline-none"
                        type="search"
                        placeholder={searchPlaceholder}
                        onChange={(e) => onSearch && onSearch(e.target.value)}
                    />
                </div>
                {/* buttons group */}
                <div className="flex items-center gap-2">

                    {apiFilter1 && (
                        <Button variant="outline" className="rounded-lg" onClick={apiFilter1.onClick}>
                            <GoColumns />
                            {apiFilter1.title}
                        </Button>
                    )}

                    {apiFilter2 && (
                        <Button variant="outline" className="rounded-lg" onClick={apiFilter2.onClick}>
                            <IoFilter />
                            {apiFilter2.title}
                        </Button>
                    )}

                    {createButtonTitle && (
                        <Button
                            variant="outline"
                            className="flex gap-2 rounded-lg"
                            onClick={apiCreate}
                        >
                            <Plus size={16} />
                            {createButtonTitle}
                        </Button>
                    )}
                </div>

            </div>
        </div>
    );
}
