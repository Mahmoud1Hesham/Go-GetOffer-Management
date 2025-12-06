"use client";
import { useEffect } from "react";
import { gsap } from "gsap";

export default function useFadeInAnimation(ref, delay = 0.1) {
    useEffect(() => {
        if (!ref.current) return;
        gsap.set(ref.current, { opacity: 0, y: 30 });
        gsap.to(ref.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay,
        });
    }, [ref, delay]);
}
