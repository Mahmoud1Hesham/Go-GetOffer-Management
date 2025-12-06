"use client";
import { gsap } from "gsap";

export default function useLabelAnimation(labelRef, options = {}) {
    const {
        yOffset = -25, // المسافة الافتراضية
        scale = 1.1,   // التكبير الافتراضي
    } = options;

    const handleFocus = () => {
        if (!labelRef.current) return;
        gsap.to(labelRef.current, {
            y: yOffset,
            scale,
            color: "var(--color-go-primary-e)",
            duration: 0.25,
            ease: "power2.out",
        });
    };

    const handleBlur = (e) => {
        if (!labelRef.current) return;
        if (!e.target.value) {
            gsap.to(labelRef.current, {
                y: 0,
                scale: 1,
                color: "#374151",
                duration: 0.25,
                ease: "power2.inOut",
            });
        }
    };

    return { handleFocus, handleBlur };
}
