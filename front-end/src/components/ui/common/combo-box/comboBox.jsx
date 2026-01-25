"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "../../command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../popover"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "../../button"

export function Combobox({ options = [], value, onChange, placeholder = "Select...", className = "" , comboinputclass="", disabled = false, multiple = false, fixedValues = [], triggerNode = null }) {
    const [open, setOpen] = React.useState(false)
        const searchParams = useSearchParams();
        const lang = searchParams.get("lang") || i18n.language || "en";
    

    const currentLabel = React.useMemo(() => {
        if (multiple) {
            const vals = Array.isArray(value) ? value : (value ? [value] : []);
            const labels = options.filter(opt => vals.some(v => String(v) === String(opt.value))).map(o => o.label);
            if (labels.length === 0) return "";
            if (labels.length === 1) return labels[0];
            return `${labels[0]} + ${labels.length - 1}`;
        }
        const found = options.find(opt => String(opt.value) === String(value));
        return found?.label ?? "";
    }, [options, value, multiple]);

    const handleSelect = (selectedValue) => {
        console.log("[Combobox] handleSelect ->", selectedValue, "current value:", value);
        // Special handling for select-all marker
        if (multiple && String(selectedValue) === '__all__') {
            const allVals = options.map(o => o.value);
            const cur = Array.isArray(value) ? value : (value ? [value] : []);
            const allSelected = allVals.every(v => cur.some(cv => String(cv) === String(v)));
            // If all selected -> deselect non-fixed (leave fixed). Else select all.
            const next = allSelected ? allVals.filter(v => fixedValues.includes(v)) : allVals;
            onChange?.(next);
            return;
        }

        if (multiple) {
            const cur = Array.isArray(value) ? [...value] : (value ? [value] : []);
            const exists = cur.some(v => String(v) === String(selectedValue));
            // Prevent removing fixed values
            if (exists && fixedValues.some(f => String(f) === String(selectedValue))) {
                // don't remove fixed
                return;
            }
            const next = exists ? cur.filter(v => String(v) !== String(selectedValue)) : [...cur, selectedValue];
            onChange?.(next);
            // keep popover open for multi-select so user can pick more
            return;
        }

        const next = String(selectedValue) === String(value) ? "" : selectedValue;
        onChange?.(next);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
                {triggerNode ? (
                    // If a custom trigger node was provided, use it as the Popover trigger.
                    triggerNode
                ) : (
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("justify-between w-full h-auto py-3  shadow-lg", className)}
                        disabled={disabled}
                    >
                        {currentLabel || placeholder}
                        <ChevronsUpDown className="opacity-50" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className={cn("w-full p-0", comboinputclass)}>
                <Command>
                    <CommandInput placeholder={lang === 'en' ? " Search..." : ' بحث...'} className="h-9" />
                    <CommandList>
                        <CommandEmpty>{lang === 'en' ? "No option found." : "لا توجد خيارات."}</CommandEmpty>
                        <CommandGroup>
                            {multiple && (
                                <CommandGroup>
                                    <CommandItem
                                        key="__all__"
                                        value={lang === 'en' ? 'Toggle select all' : 'تحديد الكل'}
                                        onSelect={() => handleSelect('__all__')}
                                    >
                                        <span>{lang === 'en' ? 'Toggle select all' : 'تحديد الكل'}</span>
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                // show checked if all non-fixed are selected
                                                (Array.isArray(value) && options.every(o => value.some(v => String(v) === String(o.value)))) ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                </CommandGroup>
                            )}
                            {options.map((opt, idx) => {
                                const selected = multiple ? (Array.isArray(value) && value.some(v => String(v) === String(opt.value))) : String(value) === String(opt.value);
                                const isFixed = fixedValues.some(f => String(f) === String(opt.value));
                                return (
                                    <CommandItem
                                        key={opt.value ?? `${String(opt.label ?? '')}-${idx}`}
                                        value={opt.label}
                                        onSelect={() => handleSelect(opt.value)}
                                    >
                                        <span className={isFixed ? 'font-semibold' : ''}>{opt.label}</span>
                                        <Check
                                            className={cn(
                                                "ml-auto",
                                                selected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
