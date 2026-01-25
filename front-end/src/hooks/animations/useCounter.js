import { useEffect, useRef, useState } from "react";

/**
 * useCounter
 *
 * A TABLE-SAFE counter hook with animation support.
 *
 * Core principles:
 * - The parent owns the value (controlled component)
 * - This hook never mutates external state directly
 * - No async logic, no loading, no optimistic updates
 *
 * Animation strategy:
 * - <input> stays stable for typing
 * - <span> is used ONLY for animation
 * - Changing `animatedValue` + `key` forces remount
 */
export function useCounter({
    value,              // Controlled numeric value from parent
    min = 0,            // Minimum allowed value
    max = Infinity,     // Maximum allowed value
    onChange,           // Parent update callback
}) {
    /**
     * Local input value (string)
     * Allows empty input and smooth typing
     */
    const [inputValue, setInputValue] = useState(String(value));

    /**
     * Animated value
     * Used only to trigger CSS animation
     */
    const [animatedValue, setAnimatedValue] = useState(value);

    /**
     * Stores animation direction:
     * - "up"   → increment
     * - "down" → decrement
     */
    const directionRef = useRef("up");

    /**
     * Tracks the last committed value.
     * Prevents animation/input reset on table re-renders.
     */
    const lastValueRef = useRef(value);

    /**
     * Sync logic
     *
     * Runs ONLY when the actual value changes,
     * not when the table re-renders.
     *
     * Responsibilities:
     * - Update input value
     * - Determine animation direction
     * - Trigger animation by updating animatedValue
     */
    useEffect(() => {
        if (lastValueRef.current !== value) {
            directionRef.current =
                value > lastValueRef.current ? "up" : "down";

            setInputValue(String(value));
            setAnimatedValue(value);

            lastValueRef.current = value;
        }
    }, [value]);

    /**
     * Commit a new value safely
     *
     * Steps:
     * 1. Convert input → number
     * 2. Ignore invalid values
     * 3. Clamp within min / max
     * 4. Prevent duplicate commits
     * 5. Notify parent
     */
    const commitValue = (rawValue) => {
        let nextValue = Number(rawValue);

        // Ignore invalid numbers
        if (Number.isNaN(nextValue)) {
            setInputValue(String(value));
            return;
        }

        // Enforce boundaries
        nextValue = Math.min(max, Math.max(min, nextValue));

        // Avoid unnecessary updates
        if (nextValue === value) {
            setInputValue(String(value));
            return;
        }

        // Determine animation direction
        directionRef.current = nextValue > value ? "up" : "down";

        // Delegate state update to parent
        onChange?.(nextValue);
    };

    /**
     * Helper for + / - buttons
     */
    const step = (delta) => {
        commitValue(value + delta);
    };

    return {
        // State
        inputValue,
        animatedValue,
        direction: directionRef.current,

        // Setters
        setInputValue,

        // Actions
        commitValue,
        step,
    };
}
