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

export function Combobox({ options = [], value, onChange, placeholder = "Select...", className = "" , comboinputclass="", disabled = false }) {
    const [open, setOpen] = React.useState(false)
        const searchParams = useSearchParams();
        const lang = searchParams.get("lang") || i18n.language || "en";
    

    const currentLabel = React.useMemo(() => {
        const found = options.find(opt => String(opt.value) === String(value));
        return found?.label ?? "";
    }, [options, value]);

    const handleSelect = (selectedValue) => {
        console.log("[Combobox] handleSelect ->", selectedValue, "current value:", value);
        const next = String(selectedValue) === String(value) ? "" : selectedValue;
        onChange?.(next);
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen} >
            <PopoverTrigger asChild>
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
            </PopoverTrigger>
            <PopoverContent className={cn("w-full p-0", comboinputclass)}>
                <Command>
                    <CommandInput placeholder={lang === 'en' ? " Search..." : ' بحث...'} className="h-9" />
                    <CommandList>
                        <CommandEmpty>{lang === 'en' ? "No option found." : "لا توجد خيارات."}</CommandEmpty>
                        <CommandGroup>
                            {options.map((opt) => (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => handleSelect(opt.value)}
                                >
                                    <span>{opt.label}</span>
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            String(value) === String(opt.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
