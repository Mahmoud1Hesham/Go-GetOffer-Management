"use client";
import { useLottie, useLottieInteractivity } from "lottie-react";

/**
 * A reusable hook to render animated Lottie illustrations with full customization
 * and optional interactivity (hover, click, scroll, etc.).
 *
 * 🔹 General Props
 * @param {Object} options - The configuration options for the Lottie animation.
 * @param {Object} options.animationData - The JSON animation data (imported file).
 * @param {boolean} [options.loop=true] - Whether the animation should loop infinitely.
 * @param {boolean} [options.autoplay=true] - Whether the animation should start automatically.
 * @param {number} [options.speed=1] - Speed of the animation (1 = normal, 2 = double speed).
 * @param {string} [options.className] - Tailwind or CSS classes for styling.
 * @param {Object} [options.style] - Inline styles for container.
 * @param {Object} [options.lottieRef] - Reference to control instance externally.
 *
 * 🔹 Event Callbacks
 * @param {Function} [options.onComplete] - Callback fired when animation finishes once.
 * @param {Function} [options.onLoopComplete] - Callback fired when a loop finishes.
 *
 * 🔹 Interactivity (optional)
 * @param {Object} [options.interactivity] - Configuration for interactivity.
 * @param {string} options.interactivity.mode - Interaction mode:
 *        "cursor" → react to hover/mouse movement
 *        "scroll" → control animation based on scroll progress
 *        "chain" → combine multiple interaction steps
 *
 * @param {Object[]} options.interactivity.actions - List of actions defining animation behavior.
 * Each action can have:
 *   - {string} type → "hover" | "seek" | "click" | "loop" | "stop" | "play"
 *   - {number[]} [frames] → Range of frames to use
 *   - {number[]} [visibility] → Scroll visibility range [start, end]
 *
 * 🔹 Example Usages
 *
 * // ✅ Simple autoplay
 * const Illustration = useLottieAnimation({
 *   animationData: myAnim,
 *   loop: true,
 *   autoplay: true,
 *   className: "w-64 h-64",
 * });
 *
 * // ✅ Interactivity with hover
 * const HoverAnim = useLottieAnimation({
 *   animationData: myAnim,
 *   interactivity: {
 *     mode: "cursor",
 *     actions: [{ type: "hover", frames: [0, 60] }]
 *   },
 *   className: "w-64 h-64",
 * });
 *
 * // ✅ Interactivity with scroll
 * const ScrollAnim = useLottieAnimation({
 *   animationData: myAnim,
 *   interactivity: {
 *     mode: "scroll",
 *     actions: [
 *       { visibility: [0, 1], type: "seek", frames: [0, 120] }
 *     ]
 *   },
 *   className: "w-64 h-64",
 * });
 *
 * // ✅ Interactivity with chain (hover then loop)
 * const ChainAnim = useLottieAnimation({
 *   animationData: myAnim,
 *   interactivity: {
 *     mode: "chain",
 *     actions: [
 *       { type: "hover", frames: [0, 50] },
 *       { type: "loop", frames: [50, 80] }
 *     ]
 *   },
 *   className: "w-64 h-64",
 * });
 *
 * @returns {JSX.Element} The rendered Lottie animation element.
 */
export function useLottieAnimation(options) {
    const baseOptions = {
        animationData: options.animationData,
        loop: options.loop ?? true,
        autoplay: options.autoplay ?? true,
        lottieRef: options.lottieRef,
        style: options.style,
        className: options.className,
        speed: options.speed ?? 1,
        onComplete: options.onComplete,
        onLoopComplete: options.onLoopComplete,
    };

    const lottieObj = useLottie(baseOptions);

    const interactiveObj = useLottieInteractivity({
        lottieObj,
        mode: options.interactivity?.mode ?? "",
        actions: options.interactivity?.actions ?? [],
    });

    return options.interactivity ? interactiveObj.View : lottieObj.View;
}
