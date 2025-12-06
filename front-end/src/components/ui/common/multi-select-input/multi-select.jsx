import * as React from "react";
import { cva } from "class-variance-authority";
import {
    CheckIcon,
    XCircle,
    ChevronDown,
    XIcon,
    WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

import PropTypes from "prop-types";
import { useSearchParams } from "next/navigation";

/**
 * MultiSelect (JSX)
 *
 * This file is a direct JS conversion of the original TypeScript component.
 * All TS types/interfaces removed but logic preserved.
 */

/* -------------------------
   Variants (class-variance-authority)
   ------------------------- */
const multiSelectVariants = cva("m-1 transition-all duration-300 ease-in-out", {
    variants: {
        variant: {
            default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
            secondary:
                "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
            destructive:
                "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
            inverted: "inverted",
        },
        badgeAnimation: {
            bounce: "hover:-translate-y-1 hover:scale-110",
            pulse: "hover:animate-pulse",
            wiggle: "hover:animate-wiggle",
            fade: "hover:opacity-80",
            slide: "hover:translate-x-1",
            none: "",
        },
    },
    defaultVariants: {
        variant: "default",
        badgeAnimation: "bounce",
    },
});

/* -------------------------
   Helper defaults
   ------------------------- */
const noop = () => { };

/* -------------------------
   Component
   ------------------------- */
export const MultiSelect = React.forwardRef(
    (
        {
            options,
            onValueChange = noop,
            variant,
            defaultValue = [],
            placeholder = "Select options",
            animation = 0,
            animationConfig,
            maxCount = 3,
            modalPopover = false,
            asChild = false,
            className,
            hideSelectAll = false,
            searchable = true,
            emptyIndicator,
            autoSize = false,
            singleLine = false,
            popoverClassName,
            disabled = false,
            responsive,
            minWidth,
            maxWidth,
            deduplicateOptions = false,
            resetOnDefaultValueChange = true,
            closeOnSelect = false,
            ...props
        },
        ref
    ) => {
        const searchParams = useSearchParams();
        const lang = searchParams.get("lang") || i18n.language || "en";

        // State
        const [selectedValues, setSelectedValues] = React.useState([...defaultValue]);
        const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
        const [isAnimating, setIsAnimating] = React.useState(false);
        const [searchValue, setSearchValue] = React.useState("");

        // ARIA announce messages
        const [politeMessage, setPoliteMessage] = React.useState("");
        const [assertiveMessage, setAssertiveMessage] = React.useState("");

        // refs for previous values
        const prevSelectedCount = React.useRef(selectedValues.length);
        const prevIsOpen = React.useRef(isPopoverOpen);
        const prevSearchValue = React.useRef(searchValue);
        const prevDefaultValueRef = React.useRef([...defaultValue]);

        // misc refs
        const buttonRef = React.useRef(null);

        // id
        const multiSelectId = typeof React.useId === "function" ? React.useId() : `multiselect-${Math.random().toString(36).slice(2, 9)}`;
        const listboxId = `${multiSelectId}-listbox`;
        const triggerDescriptionId = `${multiSelectId}-description`;
        const selectedCountId = `${multiSelectId}-count`;

        // announce function (aria-live)
        const announce = React.useCallback((message, priority = "polite") => {
            if (priority === "assertive") {
                setAssertiveMessage(message);
                setTimeout(() => setAssertiveMessage(""), 100);
            } else {
                setPoliteMessage(message);
                setTimeout(() => setPoliteMessage(""), 100);
            }
        }, []);

        /* -------------------------
           Responsive handling
           ------------------------- */
        const [screenSize, setScreenSize] = React.useState("desktop"); // mobile | tablet | desktop

        React.useEffect(() => {
            if (typeof window === "undefined") return;
            const handleResize = () => {
                const width = window.innerWidth;
                if (width < 640) setScreenSize("mobile");
                else if (width < 1024) setScreenSize("tablet");
                else setScreenSize("desktop");
            };
            handleResize();
            window.addEventListener("resize", handleResize);
            return () => {
                if (typeof window !== "undefined") window.removeEventListener("resize", handleResize);
            };
        }, []);

        const getResponsiveSettings = () => {
            if (!responsive) {
                return { maxCount: maxCount, hideIcons: false, compactMode: false };
            }
            if (responsive === true) {
                const defaultResponsive = {
                    mobile: { maxCount: 2, hideIcons: false, compactMode: true },
                    tablet: { maxCount: 4, hideIcons: false, compactMode: false },
                    desktop: { maxCount: 6, hideIcons: false, compactMode: false },
                };
                const currentSettings = defaultResponsive[screenSize] || {};
                return {
                    maxCount: currentSettings.maxCount ?? maxCount,
                    hideIcons: currentSettings.hideIcons ?? false,
                    compactMode: currentSettings.compactMode ?? false,
                };
            }
            // responsive is an object with keys mobile/tablet/desktop
            const currentSettings = (responsive && responsive[screenSize]) || {};
            return {
                maxCount: currentSettings.maxCount ?? maxCount,
                hideIcons: currentSettings.hideIcons ?? false,
                compactMode: currentSettings.compactMode ?? false,
            };
        };

        const responsiveSettings = getResponsiveSettings();

        /* -------------------------
           Animation helper classes
           ------------------------- */
        const getBadgeAnimationClass = () => {
            if (animationConfig && animationConfig.badgeAnimation) {
                switch (animationConfig.badgeAnimation) {
                    case "bounce":
                        return isAnimating ? "animate-bounce" : "hover:-translate-y-1 hover:scale-110";
                    case "pulse":
                        return "hover:animate-pulse";
                    case "wiggle":
                        return "hover:animate-wiggle";
                    case "fade":
                        return "hover:opacity-80";
                    case "slide":
                        return "hover:translate-x-1";
                    case "none":
                        return "";
                    default:
                        return "";
                }
            }
            return isAnimating ? "animate-bounce" : "";
        };

        const getPopoverAnimationClass = () => {
            if (animationConfig && animationConfig.popoverAnimation) {
                switch (animationConfig.popoverAnimation) {
                    case "scale":
                        return "animate-scaleIn";
                    case "slide":
                        return "animate-slideInDown";
                    case "fade":
                        return "animate-fadeIn";
                    case "flip":
                        return "animate-flipIn";
                    case "none":
                        return "";
                    default:
                        return "";
                }
            }
            return "";
        };

        /* -------------------------
           Option utilities (dedupe / grouped)
           ------------------------- */
        const isGroupedOptions = React.useCallback((opts) => {
            return Array.isArray(opts) && opts.length > 0 && Object.prototype.hasOwnProperty.call(opts[0], "heading");
        }, []);

        const getAllOptions = React.useCallback(() => {
            if (!Array.isArray(options) || options.length === 0) return [];
            let allOptions;
            if (isGroupedOptions(options)) {
                allOptions = options.flatMap((group) => group.options || []);
            } else {
                allOptions = options;
            }

            const valueSet = new Set();
            const duplicates = [];
            const uniqueOptions = [];
            allOptions.forEach((option) => {
                const val = option && option.value;
                if (valueSet.has(val)) {
                    duplicates.push(val);
                    if (!deduplicateOptions) {
                        uniqueOptions.push(option);
                    }
                } else {
                    valueSet.add(val);
                    uniqueOptions.push(option);
                }
            });

            if (process.env.NODE_ENV === "development" && duplicates.length > 0) {
                const action = deduplicateOptions ? "automatically removed" : "detected";
                console.warn(
                    `MultiSelect: Duplicate option values ${action}: ${duplicates.join(
                        ", "
                    )}. ${deduplicateOptions
                        ? "Duplicates have been removed automatically."
                        : "This may cause unexpected behavior. Consider setting 'deduplicateOptions={true}' or ensure all option values are unique."
                    }`
                );
            }
            return deduplicateOptions ? uniqueOptions : allOptions;
        }, [options, deduplicateOptions, isGroupedOptions]);

        const getOptionByValue = React.useCallback((value) => {
            const option = getAllOptions().find((o) => o && o.value === value);
            if (!option && process.env.NODE_ENV === "development") {
                console.warn(`MultiSelect: Option with value "${value}" not found in options list`);
            }
            return option;
        }, [getAllOptions]);

        /* -------------------------
           Filtering / search
           ------------------------- */
        const filteredOptions = React.useMemo(() => {
            if (!searchable || !searchValue) return options || [];
            if (!Array.isArray(options) || options.length === 0) return [];
            if (isGroupedOptions(options)) {
                return options
                    .map((group) => ({
                        ...group,
                        options: (group.options || []).filter(
                            (option) =>
                                (option.label || "").toLowerCase().includes(searchValue.toLowerCase()) ||
                                (option.value || "").toLowerCase().includes(searchValue.toLowerCase())
                        ),
                    }))
                    .filter((group) => (group.options || []).length > 0);
            }
            return (options || []).filter(
                (option) =>
                    (option.label || "").toLowerCase().includes(searchValue.toLowerCase()) ||
                    (option.value || "").toLowerCase().includes(searchValue.toLowerCase())
            );
        }, [options, searchValue, searchable, isGroupedOptions]);

        /* -------------------------
           Keyboard handling for CommandInput
           ------------------------- */
        const handleInputKeyDown = (event) => {
            if (event.key === "Enter") {
                setIsPopoverOpen(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                try {
                    onValueChange(newSelectedValues);
                } catch (e) { }
            }
        };

        /* -------------------------
           Selection actions
           ------------------------- */
        const toggleOption = (optionValue) => {
            if (disabled) return;
            const option = getOptionByValue(optionValue);
            if (option && option.disabled) return;
            const newSelectedValues = selectedValues.includes(optionValue)
                ? selectedValues.filter((v) => v !== optionValue)
                : [...selectedValues, optionValue];
            setSelectedValues(newSelectedValues);
            try {
                onValueChange(newSelectedValues);
            } catch (e) { }
            if (closeOnSelect) setIsPopoverOpen(false);
        };

        const handleClear = () => {
            if (disabled) return;
            setSelectedValues([]);
            try {
                onValueChange([]);
            } catch (e) { }
        };

        const handleTogglePopover = () => {
            if (disabled) return;
            setIsPopoverOpen((p) => !p);
        };

        const clearExtraOptions = () => {
            if (disabled) return;
            const newSelectedValues = selectedValues.slice(0, responsiveSettings.maxCount);
            setSelectedValues(newSelectedValues);
            try {
                onValueChange(newSelectedValues);
            } catch (e) { }
        };

        const toggleAll = () => {
            if (disabled) return;
            const allOptions = getAllOptions().filter((option) => !option.disabled);
            if (selectedValues.length === allOptions.length) {
                handleClear();
            } else {
                const allValues = allOptions.map((o) => o.value);
                setSelectedValues(allValues);
                try {
                    onValueChange(allValues);
                } catch (e) { }
            }
            if (closeOnSelect) setIsPopoverOpen(false);
        };

        /* -------------------------
           Reset on defaultValue change
           ------------------------- */
        React.useEffect(() => {
            if (!resetOnDefaultValueChange) return;
            const prevDefaultValue = prevDefaultValueRef.current || [];
            const prevSorted = [...prevDefaultValue].sort();
            const currentSorted = [...defaultValue].sort();
            if (JSON.stringify(prevSorted) !== JSON.stringify(currentSorted)) {
                if (JSON.stringify([...selectedValues].sort()) !== JSON.stringify(currentSorted)) {
                    setSelectedValues([...defaultValue]);
                }
                prevDefaultValueRef.current = [...defaultValue];
            }
        }, [defaultValue, selectedValues, resetOnDefaultValueChange]);

        /* -------------------------
           Width constraints (min/max/auto)
           ------------------------- */
        const getWidthConstraints = () => {
            const defaultMinWidth = screenSize === "mobile" ? "0px" : "200px";
            const effectiveMinWidth = minWidth || defaultMinWidth;
            const effectiveMaxWidth = maxWidth || "100%";
            return {
                minWidth: effectiveMinWidth,
                maxWidth: effectiveMaxWidth,
                width: autoSize ? "auto" : "100%",
            };
        };

        const widthConstraints = getWidthConstraints();

        React.useEffect(() => {
            if (!isPopoverOpen) setSearchValue("");
        }, [isPopoverOpen]);

        /* -------------------------
           Accessibility announcements & changes watchers
           ------------------------- */
        React.useEffect(() => {
            const selectedCount = selectedValues.length;
            const allOptions = getAllOptions();
            const totalOptions = allOptions.filter((opt) => !opt.disabled).length;

            if (selectedCount !== prevSelectedCount.current) {
                const diff = selectedCount - prevSelectedCount.current;
                if (diff > 0) {
                    const addedItems = selectedValues.slice(-diff);
                    const addedLabels = addedItems
                        .map((value) => allOptions.find((opt) => opt.value === value)?.label)
                        .filter(Boolean);
                    if (addedLabels.length === 1) {
                        announce(`${addedLabels[0]} selected. ${selectedCount} of ${totalOptions} options selected.`);
                    } else {
                        announce(`${addedLabels.length} options selected. ${selectedCount} of ${totalOptions} total selected.`);
                    }
                } else if (diff < 0) {
                    announce(`Option removed. ${selectedCount} of ${totalOptions} options selected.`);
                }
                prevSelectedCount.current = selectedCount;
            }

            if (isPopoverOpen !== prevIsOpen.current) {
                if (isPopoverOpen) {
                    announce(`Dropdown opened. ${totalOptions} options available. Use arrow keys to navigate.`);
                } else {
                    announce("Dropdown closed.");
                }
                prevIsOpen.current = isPopoverOpen;
            }

            if (searchValue !== prevSearchValue.current && searchValue !== undefined) {
                if (searchValue && isPopoverOpen) {
                    const filteredCount = allOptions.filter(
                        (opt) =>
                            (opt.label || "").toLowerCase().includes(searchValue.toLowerCase()) ||
                            (opt.value || "").toLowerCase().includes(searchValue.toLowerCase())
                    ).length;
                    announce(`${filteredCount} option${filteredCount === 1 ? "" : "s"} found for "${searchValue}"`);
                }
                prevSearchValue.current = searchValue;
            }
        }, [selectedValues, isPopoverOpen, searchValue, announce, getAllOptions]);

        /* -------------------------
           Imperative handle (ref)
           ------------------------- */
        React.useImperativeHandle(ref, () => ({
            reset: () => {
                setSelectedValues([...defaultValue]);
                setIsPopoverOpen(false);
                setSearchValue("");
                try { onValueChange([...defaultValue]); } catch (e) { }
            },
            getSelectedValues: () => selectedValues,
            setSelectedValues: (values) => {
                setSelectedValues(values);
                try { onValueChange(values); } catch (e) { }
            },
            clear: () => {
                setSelectedValues([]);
                try { onValueChange([]); } catch (e) { }
            },
            focus: () => {
                if (buttonRef.current) {
                    buttonRef.current.focus();
                    // visual outline effect preserved from original implementation
                    const originalOutline = buttonRef.current.style.outline;
                    const originalOutlineOffset = buttonRef.current.style.outlineOffset;
                    try {
                        buttonRef.current.style.outline = "2px solid hsl(var(--ring))";
                        buttonRef.current.style.outlineOffset = "2px";
                        setTimeout(() => {
                            if (buttonRef.current) {
                                buttonRef.current.style.outline = originalOutline;
                                buttonRef.current.style.outlineOffset = originalOutlineOffset;
                            }
                        }, 1000);
                    } catch (e) { }
                }
            },
        }), [defaultValue, selectedValues, onValueChange]);

        /* -------------------------
           Render
           ------------------------- */
        return (
            <>
                {/* aria-live containers */}
                <div className="sr-only">
                    <div aria-live="polite" aria-atomic="true" role="status">{politeMessage}</div>
                    <div aria-live="assertive" aria-atomic="true" role="alert">{assertiveMessage}</div>
                </div>

                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={modalPopover}>
                    <div id={triggerDescriptionId} className="sr-only">
                        Multi-select dropdown. Use arrow keys to navigate, Enter to select, and Escape to close.
                    </div>

                    <div id={selectedCountId} className="sr-only" aria-live="polite">
                        {selectedValues.length === 0
                            ? "No options selected"
                            : `${selectedValues.length} option${selectedValues.length === 1 ? "" : "s"} selected: ${selectedValues
                                .map((value) => getOptionByValue(value)?.label)
                                .filter(Boolean)
                                .join(", ")}`}
                    </div>

                    <PopoverTrigger asChild>
                        <Button
                            ref={buttonRef}
                            {...props}
                            onClick={handleTogglePopover}
                            disabled={disabled}
                            role="combobox"
                            aria-expanded={isPopoverOpen}
                            aria-haspopup="listbox"
                            aria-controls={isPopoverOpen ? listboxId : undefined}
                            aria-describedby={`${triggerDescriptionId} ${selectedCountId}`}
                            aria-label={`Multi-select: ${selectedValues.length} of ${getAllOptions().length} options selected. ${placeholder}`}
                            className={cn(
                                "flex p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit [&_svg]:pointer-events-auto",
                                autoSize ? "w-auto" : "w-full",
                                responsiveSettings.compactMode && "min-h-8 text-sm",
                                screenSize === "mobile" && "min-h-12 text-base",
                                disabled && "opacity-50 cursor-not-allowed",
                                className
                            )}
                            style={{
                                ...widthConstraints,
                                maxWidth: `min(${widthConstraints.maxWidth}, 100%)`,
                            }}
                        >
                            {selectedValues.length > 0 ? (
                                <div className="flex justify-between items-center w-full">
                                    <div
                                        className={cn(
                                            "flex items-center gap-1",
                                            singleLine ? "overflow-x-auto multiselect-singleline-scroll" : "flex-wrap",
                                            responsiveSettings.compactMode && "gap-0.5"
                                        )}
                                        style={singleLine ? { paddingBottom: "4px" } : {}}
                                    >
                                        {selectedValues
                                            .slice(0, responsiveSettings.maxCount)
                                            .map((value) => {
                                                const option = getOptionByValue(value);
                                                const IconComponent = option && option.icon;
                                                const customStyle = option && option.style;
                                                if (!option) return null;
                                                const badgeStyle = {
                                                    animationDuration: `${animation}s`,
                                                    ...(customStyle && customStyle.badgeColor ? { backgroundColor: customStyle.badgeColor } : {}),
                                                    ...(customStyle && customStyle.gradient ? { background: customStyle.gradient, color: "white" } : {}),
                                                };
                                                return (
                                                    <Badge
                                                        key={value}
                                                        className={cn(
                                                            getBadgeAnimationClass(),
                                                            multiSelectVariants({ variant }),
                                                            customStyle && customStyle.gradient && "text-white border-transparent",
                                                            responsiveSettings.compactMode && "text-xs px-1.5 py-0.5",
                                                            screenSize === "mobile" && "max-w-[120px] truncate",
                                                            singleLine && "flex-shrink-0 whitespace-nowrap",
                                                            "[&>svg]:pointer-events-auto"
                                                        )}
                                                        style={{
                                                            ...badgeStyle,
                                                            animationDuration: `${(animationConfig && animationConfig.duration) || animation}s`,
                                                            animationDelay: `${(animationConfig && animationConfig.delay) || 0}s`,
                                                        }}
                                                    >
                                                        {IconComponent && !responsiveSettings.hideIcons && (
                                                            <IconComponent
                                                                className={cn(
                                                                    "h-4 w-4",
                                                                    lang === 'en' ? 'mr-2' : 'ml-2',
                                                                    responsiveSettings.compactMode && "h-3 w-3 mr-1",
                                                                    customStyle && customStyle.iconColor && "text-current"
                                                                )}
                                                                {...(customStyle && customStyle.iconColor ? { style: { color: customStyle.iconColor } } : {})}
                                                            />
                                                        )}
                                                        <span className={cn(screenSize === "mobile" && "truncate")}>{option.label}</span>
                                                        <div
                                                            role="button"
                                                            tabIndex={0}
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                toggleOption(value);
                                                            }}
                                                            onKeyDown={(event) => {
                                                                if (event.key === "Enter" || event.key === " ") {
                                                                    event.preventDefault();
                                                                    event.stopPropagation();
                                                                    toggleOption(value);
                                                                }
                                                            }}
                                                            aria-label={`Remove ${option.label} from selection`}
                                                            className={`${lang === 'en' ? 'ml-2' : 'mr-2'}  h-4 w-4 cursor-pointer hover:bg-white/20 rounded-sm p-0.5 -m-0.5 focus:outline-none focus:ring-1 focus:ring-white/50`}
                                                        >
                                                            <XCircle
                                                                className={cn(
                                                                    "h-3 w-3",
                                                                    responsiveSettings.compactMode && "h-2.5 w-2.5"
                                                                )}
                                                            />
                                                        </div>
                                                    </Badge>
                                                );
                                            })
                                            .filter(Boolean)}
                                        {selectedValues.length > responsiveSettings.maxCount && (
                                            <Badge
                                                className={cn(
                                                    "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                                                    getBadgeAnimationClass(),
                                                    multiSelectVariants({ variant }),
                                                    responsiveSettings.compactMode && "text-xs px-1.5 py-0.5",
                                                    singleLine && "flex-shrink-0 whitespace-nowrap",
                                                    "[&>svg]:pointer-events-auto"
                                                )}
                                                style={{
                                                    animationDuration: `${(animationConfig && animationConfig.duration) || animation}s`,
                                                    animationDelay: `${(animationConfig && animationConfig.delay) || 0}s`,
                                                }}
                                            >
                                                {lang === 'en' ? `${`+ ${selectedValues.length - responsiveSettings.maxCount} more`}` : `${`المزيد ${selectedValues.length - responsiveSettings.maxCount} + `}`}
                                                
                                                
                                                <XCircle
                                                    className={cn(`${lang === 'en' ? 'ml-2' : 'mr-2'} h-4 w-4 cursor-pointer`, responsiveSettings.compactMode && "ml-2 h-3 w-3")}
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        clearExtraOptions();
                                                    }}
                                                />
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleClear();
                                            }}
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter" || event.key === " ") {
                                                    event.preventDefault();
                                                    event.stopPropagation();
                                                    handleClear();
                                                }
                                            }}
                                            aria-label={`Clear all ${selectedValues.length} selected options`}
                                            className="flex items-center justify-center h-4 w-4 mx-2 cursor-pointer text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm"
                                        >
                                            <XIcon className="h-4 w-4" />
                                        </div>

                                        <Separator orientation="vertical" className="flex min-h-6 h-full" />
                                        <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" aria-hidden="true" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full mx-auto">
                                    <span className="text-sm text-muted-foreground mx-3">{placeholder}</span>
                                    <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                                </div>
                            )}
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent
                        id={listboxId}
                        role="listbox"
                        aria-multiselectable="true"
                        aria-label="Available options"
                        className={cn(
                            "w-auto p-0",
                            getPopoverAnimationClass(),
                            screenSize === "mobile" && "w-[85vw] max-w-[280px]",
                            screenSize === "tablet" && "w-[70vw] max-w-md",
                            screenSize === "desktop" && "min-w-[300px]",
                            popoverClassName
                        )}
                        style={{
                            animationDuration: `${(animationConfig && animationConfig.duration) || animation}s`,
                            animationDelay: `${(animationConfig && animationConfig.delay) || 0}s`,
                            maxWidth: `min(${widthConstraints.maxWidth}, 85vw)`,
                            maxHeight: screenSize === "mobile" ? "70vh" : "60vh",
                            touchAction: "manipulation",
                        }}
                        align="start"
                        onEscapeKeyDown={() => setIsPopoverOpen(false)}
                    >
                        <Command>
                            {searchable && (
                                <CommandInput
                                    placeholder={lang === 'en' ?"Search options..." : "  ابحث فى الاختيارات..."}
                                    onKeyDown={handleInputKeyDown}
                                    value={searchValue}
                                    onValueChange={setSearchValue}
                                    aria-label="Search through available options"
                                    aria-describedby={`${multiSelectId}-search-help`}
                                />
                            )}
                            {searchable && (
                                <div id={`${multiSelectId}-search-help`} className="sr-only">
                                    Type to filter options. Use arrow keys to navigate results.
                                </div>
                            )}

                            <CommandList
                                className={cn(
                                    "max-h-[40vh] overflow-y-auto multiselect-scrollbar",
                                    screenSize === "mobile" && "max-h-[50vh]",
                                    "overscroll-behavior-y-contain"
                                )}
                            >
                                <CommandEmpty>{emptyIndicator || "No results found."}</CommandEmpty>

                                {!hideSelectAll && !searchValue && (
                                    <CommandGroup>
                                        <CommandItem
                                            key="all"
                                            onSelect={toggleAll}
                                            role="option"
                                            aria-selected={
                                                selectedValues.length === getAllOptions().filter((opt) => !opt.disabled).length
                                            }
                                            aria-label={`Select all ${getAllOptions().length} options`}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    selectedValues.length === getAllOptions().filter((opt) => !opt.disabled).length
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                                aria-hidden="true"
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            <span>
                                                ({lang === 'en' ? 'Select All' : 'اختيار الكل'}{getAllOptions().length > 20 ? ` - ${getAllOptions().length} options` : ""})
                                            </span>
                                        </CommandItem>
                                    </CommandGroup>
                                )}

                                {isGroupedOptions(filteredOptions) ? (
                                    filteredOptions.map((group) => (
                                        <CommandGroup key={group.heading} heading={group.heading}>
                                            {(group.options || []).map((option) => {
                                                const isSelected = selectedValues.includes(option.value);
                                                return (
                                                    <CommandItem
                                                        key={option.value}
                                                        onSelect={() => toggleOption(option.value)}
                                                        role="option"
                                                        aria-selected={isSelected}
                                                        aria-disabled={option.disabled}
                                                        aria-label={`${option.label}${isSelected ? ", selected" : ", not selected"}${option.disabled ? ", disabled" : ""}`}
                                                        className={cn("cursor-pointer", option.disabled && "opacity-50 cursor-not-allowed")}
                                                        disabled={option.disabled}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                                isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                            )}
                                                            aria-hidden="true"
                                                        >
                                                            <CheckIcon className="h-4 w-4" />
                                                        </div>
                                                        {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                                                        <span>{option.label}</span>
                                                    </CommandItem>
                                                );
                                            })}
                                        </CommandGroup>
                                    ))
                                ) : (
                                    <CommandGroup>
                                        {(filteredOptions || []).map((option) => {
                                            const isSelected = selectedValues.includes(option.value);
                                            return (
                                                <CommandItem
                                                    key={option.value}
                                                    onSelect={() => toggleOption(option.value)}
                                                    role="option"
                                                    aria-selected={isSelected}
                                                    aria-disabled={option.disabled}
                                                    aria-label={`${option.label}${isSelected ? ", selected" : ", not selected"}${option.disabled ? ", disabled" : ""}`}
                                                    className={cn("cursor-pointer", option.disabled && "opacity-50 cursor-not-allowed")}
                                                    disabled={option.disabled}
                                                >
                                                    <div
                                                        className={cn(
                                                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                            isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                        )}
                                                        aria-hidden="true"
                                                    >
                                                        <CheckIcon className="h-4 w-4" />
                                                    </div>
                                                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden="true" />}
                                                    <span>{option.label}</span>
                                                </CommandItem>
                                            );
                                        })}
                                    </CommandGroup>
                                )}

                                <CommandSeparator />

                                <CommandGroup>
                                    <div className="flex items-center justify-between">
                                        {selectedValues.length > 0 && (
                                            <>
                                                <CommandItem onSelect={handleClear} className="flex-1 justify-center cursor-pointer">
                                                    {lang === 'en' ? 'Clear' : 'محو الكل'}
                                                </CommandItem>
                                                <Separator orientation="vertical" className="flex min-h-6 h-full" />
                                            </>
                                        )}
                                        <CommandItem onSelect={() => setIsPopoverOpen(false)} className="flex-1 justify-center cursor-pointer max-w-full">
                                            {lang === 'en' ? 'Close' : 'غلق'}
                                        </CommandItem>
                                    </div>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>

                    {animation > 0 && selectedValues.length > 0 && (
                        <WandSparkles
                            className={cn("cursor-pointer my-2 text-foreground bg-background w-3 h-3", isAnimating ? "" : "text-muted-foreground")}
                            onClick={() => setIsAnimating((s) => !s)}
                        />
                    )}
                </Popover>
            </>
        );
    }
);

MultiSelect.displayName = "MultiSelect";

/* -------------------------
   PropTypes (runtime checks)
   ------------------------- */
MultiSelect.propTypes = {
    options: PropTypes.oneOfType([
        // array of options
        PropTypes.arrayOf(
            PropTypes.shape({
                label: PropTypes.string,
                value: PropTypes.string.isRequired,
                icon: PropTypes.oneOfType([PropTypes.func, PropTypes.element]),
                disabled: PropTypes.bool,
                style: PropTypes.object,
            })
        ),
        // or grouped options
        PropTypes.arrayOf(
            PropTypes.shape({
                heading: PropTypes.string,
                options: PropTypes.array,
            })
        ),
    ]).isRequired,
    onValueChange: PropTypes.func,
    variant: PropTypes.string,
    defaultValue: PropTypes.arrayOf(PropTypes.string),
    placeholder: PropTypes.string,
    animation: PropTypes.number,
    animationConfig: PropTypes.object,
    maxCount: PropTypes.number,
    modalPopover: PropTypes.bool,
    asChild: PropTypes.bool,
    className: PropTypes.string,
    hideSelectAll: PropTypes.bool,
    searchable: PropTypes.bool,
    emptyIndicator: PropTypes.node,
    autoSize: PropTypes.bool,
    singleLine: PropTypes.bool,
    popoverClassName: PropTypes.string,
    disabled: PropTypes.bool,
    responsive: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    minWidth: PropTypes.string,
    maxWidth: PropTypes.string,
    deduplicateOptions: PropTypes.bool,
    resetOnDefaultValueChange: PropTypes.bool,
    closeOnSelect: PropTypes.bool,
};

MultiSelect.defaultProps = {
    onValueChange: () => { },
    defaultValue: [],
    placeholder: "Select options",
    animation: 0,
    maxCount: 3,
    modalPopover: false,
    asChild: false,
    hideSelectAll: false,
    searchable: true,
    autoSize: false,
    singleLine: false,
    disabled: false,
    deduplicateOptions: false,
    resetOnDefaultValueChange: true,
    closeOnSelect: false,
};

/* -------------------------
   Export default
   ------------------------- */
export default MultiSelect;