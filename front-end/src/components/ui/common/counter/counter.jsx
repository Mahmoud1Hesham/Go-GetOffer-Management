import { useCounter } from "@/hooks/animations/useCounter";

/**
 * Counter (UI Component)
 *
 * A presentational component that renders:
 * - Decrease button
 * - Editable numeric input
 * - Animated value overlay
 * - Increase button
 *
 * Animation logic:
 * - The input is always transparent (used only for typing)
 * - The animated <span> sits above the input
 * - Changing `key={animatedValue}` forces remount
 * - CSS animation plays on mount
 */
export default function Counter({
    value,
    min = 0,
    max = Infinity,
    onChange,
}) {
    const {
        inputValue,
        animatedValue,
        direction,
        setInputValue,
        commitValue,
        step,
    } = useCounter({
        value,
        min,
        max,
        onChange,
    });

    return (
        <div className="flex items-center gap-1">
            {/* Decrease button */}
            <button
                onClick={() => step(-1)}
                disabled={value <= min}
                className="w-7 aspect-square rounded-full bg-gray-100 text-lg disabled:opacity-40"
                aria-label="Decrease value"
            >
                −
            </button>

            {/* Value container */}
            <div className="relative w-6 h-6 text-center overflow-hidden">
                {/* Animated number layer */}
                <span
                    key={animatedValue}
                    className={`absolute inset-0 flex items-center justify-center text-base font-medium pointer-events-none
            ${direction === "up"
                            ? "animate-counter-up"
                            : "animate-counter-down"
                        }
          `}
                >
                    {animatedValue}
                </span>

                {/* Editable input layer */}
                <input
                    type="text"
                    inputMode="numeric"
                    value={inputValue}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) =>
                        setInputValue(e.target.value.replace(/\D/g, ""))
                    }
                    onBlur={() => commitValue(inputValue)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "ArrowUp") step(1);
                        if (e.key === "ArrowDown") step(-1);
                    }}
                    className="absolute inset-0 w-full text-center bg-transparent outline-none text-transparent caret-black"
                    aria-label="Counter input"
                />
            </div>

            {/* Increase button */}
            <button
                onClick={() => step(1)}
                disabled={value >= max}
                className="w-7 aspect-square rounded-full bg-gray-100 text-lg disabled:opacity-40"
                aria-label="Increase value"
            >
                +
            </button>
        </div>
    );
}
