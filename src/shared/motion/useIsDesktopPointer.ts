import { useEffect, useState } from "react";

// 992px === Chakra "lg" — the breakpoint where the cards already switch to a
// side-by-side desktop layout. `pointer: fine` keeps the scroll-jack off touch
// devices, where a native swipe deck is the better (and safer) experience.
const QUERY = "(min-width: 992px) and (pointer: fine)";

const getInitial = (): boolean =>
    typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches;

export const useIsDesktopPointer = (): boolean => {
    const [match, setMatch] = useState<boolean>(getInitial);

    useEffect(() => {
        if (!window.matchMedia) return;

        const mq = window.matchMedia(QUERY);
        const onChange = () => setMatch(mq.matches);
        onChange();

        if (mq.addEventListener) {
            mq.addEventListener("change", onChange);
            return () => mq.removeEventListener("change", onChange);
        }

        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
    }, []);

    return match;
};
