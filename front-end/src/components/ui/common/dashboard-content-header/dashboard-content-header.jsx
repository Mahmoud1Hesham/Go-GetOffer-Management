"use client";

import React from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Combobox } from "../combo-box/comboBox";
import { IoFilter } from "react-icons/io5";
import { GoColumns } from "react-icons/go";
import Tabs, { TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardContentHeader({
    title = "",
    createButtonTitle,
    createComponent, 
    searchPlaceholder = "ابحث...",
    tabs,
    activeTab = 'all',
    onTabChange,
    apiFilter1,
    apiFilter2,
    apiCreate,
    onSearch,
    // new props for column visibility control
    columns,
    visibleColumns,
    onVisibleColumnsChange,
}) {
    return (
        <div className="w-full bg-white border-b border-go-border-l-e flex flex-col py-4">
            {/* title */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-semibold">{title}</h1>
            </div>

            {/* actions row */}
            <div className="flex justify-between items-center gap-32 flex-wrap">
                {/* search input or tabs */}
                {tabs && Array.isArray(tabs) ? (
                    <div className="">
                        <Tabs defaultValue={String(activeTab ?? (tabs[0] && tabs[0].value))} value={String(activeTab ?? undefined)} onValueChange={(v) => onTabChange && onTabChange(v)}>
                            <TabsList className="bg-go-bg-l-e flex gap-2 px-2 rounded-lg">
                                {tabs.map((t) => (
                                    <TabsTrigger className="bg-go-bg-l-e rounded-lg" key={t.value} value={String(t.value)}>
                                        <div className="flex items-center gap-4">
                                            <span>{t.label}</span>
                                        </div>
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>
                ) : (
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <Input
                            className="pl-10 outline-none"
                            type="search"
                            placeholder={searchPlaceholder}
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>
                )}
                {/* buttons group */}
                <div className="flex items-center gap-2">

                    {/* Column customization: use Combobox when `columns` prop provided */}
                    {columns ? (
                        <div className="w-36">
                            {(() => {
                                const options = (columns || []).filter(c => c && c.key !== 'checkbox' && (c.title || '').toString().trim() !== '').map(c => ({ value: c.key, label: c.title }));
                                const fixed = (columns || []).filter(c => ['code', 'avatar'].includes(c.key)).map(c => c.key);

                                return (
                                    <Combobox
                                        multiple
                                        options={options}
                                value={visibleColumns}
                                        fixedValues={fixed}
                                        onChange={(val) => {
                                            const incoming = Array.isArray(val) ? val : (val ? [val] : []);
                                            const merged = Array.from(new Set([...fixed, ...incoming]));
                                            if (!merged || merged.length === 0) return; // never allow zero
                                            onVisibleColumnsChange && onVisibleColumnsChange(merged);
                                        }}
                                        // Provide a custom trigger node so this instance shows the icon + provided title
                                        triggerNode={
                                            <Button variant="outline" className="flex items-center gap-2 justify-start w-full py-2 px-2">
                                                <GoColumns size={14} />
                                                <span className="text-sm">{apiFilter1?.title ?? 'أعمدة'}</span>
                                            </Button>
                                        }
                                        className="rounded-lg"
                                        comboinputclass="px-0"
                                    />
                                );
                            })()}
                        </div>
                    ) : apiFilter1 && (
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

                    {/* Build the header button once so we can either render it directly
                        or inject it as the dialog trigger into a provided `createComponent`. */}
                    {(() => {
                        const headerButton = (
                            <Button variant="outline" className="flex gap-2 rounded-lg">
                                <Plus size={16} />
                                {createButtonTitle}
                            </Button>
                        )

                        if (createComponent) {
                            // If createComponent is a React element, clone it and pass the header button
                            // as `triggerNode` so the dialog can use it as its trigger (via `asChild`).
                            if (React.isValidElement(createComponent)) {
                                return React.cloneElement(createComponent, { triggerNode: headerButton })
                            }

                            // Otherwise render whatever was passed (fallback)
                            return createComponent
                        }

                        // No createComponent provided: render header button with the supplied apiCreate handler
                        return (
                            createButtonTitle && (
                                <Button
                                    variant="outline"
                                    className="flex gap-2 rounded-lg"
                                    onClick={apiCreate}
                                >
                                    <Plus size={16} />
                                    {createButtonTitle}
                                </Button>
                            )
                        )
                    })()}
                </div>

            </div>
        </div>
    );
}
