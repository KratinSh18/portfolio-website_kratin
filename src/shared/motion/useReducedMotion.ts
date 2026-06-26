import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

const getInitial = (): boolean =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches;

/**
 * Returns whether the user has requested reduced motion, and keeps tracking
 * changes to the setting at runtime.
 */
export const useReducedMotion = (): boolean => {
    const [reduced, setReduced] = useState<boolean>(getInitial);

    useEffect(() => {
        if (!window.matchMedia) return;

        const mq = window.matchMedia(QUERY);
        const onChange = () => setReduced(mq.matches);
        onChange();

        if (mq.addEventListener) {
            mq.addEventListener("change", onChange);
            return () => mq.removeEventListener("change", onChange);
        }

        // Safari < 14 fallback
        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
    }, []);

    return reduced;
};
