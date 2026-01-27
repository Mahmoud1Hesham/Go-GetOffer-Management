"use client";
import { useRef, useState } from "react";
import { BsEyeFill } from "react-icons/bs";
import { RiEyeCloseLine } from "react-icons/ri";
import useLabelAnimation from "@/hooks/animations/useLabelAnimation";
import { useSearchParams } from "next/navigation";
import { Combobox } from "../combo-box/comboBox";

export default function Input({
    label,
    placeholder,
    type = "text",
    className = "",
    scale = 1,
    comboStyle = "",
    comboinputclass = "",
    value = '',
    shadow = 'shadow-lg',
    ...props
}) {
    const searchParams = useSearchParams();
    const lang = searchParams.get("lang") || i18n.language || "ar";

    const labelRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    const finalType = type === "password" ? (showPassword ? "text" : "password") : type;

    const hasLabel = !!label;
    const hasPlaceholder = !!placeholder;
    const hasLabelAndPlaceholder = hasLabel && hasPlaceholder;
    let yOffset = -35;
    if (hasLabelAndPlaceholder) yOffset = -25;
    if (type === "textarea") yOffset = -75;

    const { handleFocus, handleBlur } = useLabelAnimation(labelRef, { yOffset, scale });

    const inputPadding = hasLabelAndPlaceholder ? "pt-5 pb-3" : "py-3";

    function getTopClass(type, hasLabel, hasLabelAndPlaceholder, hasPlaceholder) {
        const normalizedType = typeof type === "string" ? type.toLowerCase().trim() : "";

        if (normalizedType === "combobox") {
            return hasLabelAndPlaceholder ? "-top-0 text-sm" : "top-5";
        }

        if (normalizedType === "textarea") {
            return hasLabel ? "top-1/3 text-sm" : "top-1/3";
        }
        if (normalizedType === "text") {
            return hasLabel ? "top-1 text-sm" : "top-1/4";
        }

        if (hasLabelAndPlaceholder) {
            return "top-1 text-sm";
        }
        if (hasPlaceholder) {
            return "top-1/4";
        }

        return "top-1"; // default لباقي الـ inputs
    }


    return (
        <div className={`relative field ${className}`}>
            {/* Label */}
            {hasLabel && (
                <label
                    ref={labelRef}
                    className={`absolute ${lang === 'en' ? 'left-3' : 'right-3 text-xs'} font-semibold pointer-events-none transition-all duration-200
                                ${getTopClass(type, hasLabel, hasLabelAndPlaceholder, hasPlaceholder)}}`}
                >
                    {label}
                </label>
            )}

            {/* Combobox */}
            {type === "combobox" ? (
                <div
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    className={`w-full`}
                >
                    <Combobox
                        options={props.options}
                        value={value}
                        onChange={props.onChange}
                        placeholder={placeholder}
                        className={`w-full ${comboStyle}`}
                        comboinputclass={comboinputclass}

                    />
                </div>
            ) : type === "textarea" ? (
                <textarea
                    {...props}
                    placeholder={placeholder}
                    scale={scale}
                    onFocus={(e) => {
                        handleFocus();
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        handleBlur(e);
                        props.onBlur?.(e);
                    }}
                    rows={5}
                    className={`border border-gray-300 px-3 ${inputPadding} ${shadow} rounded-md bg-white w-full ${props.className || ""}`}
                />
            ) : (
                <>
                    <input
                        type={finalType}
                        {...props}
                        placeholder={placeholder}
                        scale={scale}
                        onFocus={(e) => {
                            handleFocus();
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            handleBlur(e);
                            props.onBlur?.(e);
                        }}
                        value={value}
                        className={`border border-gray-300 ring-0 outline-0 px-3 ${inputPadding} ${shadow} rounded-md w-full bg-white ${props.className || ""}`}
                    />
                    {type === "password" && (
                        <span
                            className={`absolute ${lang === 'en' ? 'right-3' : 'left-3'}  top-1/2 -translate-y-1/2 cursor-pointer text-gray-600`}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <BsEyeFill size={20} /> : <RiEyeCloseLine size={20} />}
                        </span>
                    )}
                </>
            )}
        </div>
    );
}
