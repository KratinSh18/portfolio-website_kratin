import { useEffect, useState } from "react";

/**
 * One-shot "intro finished" signal. The Preloader calls markPreloaderDone()
 * when its curtain lifts; hero entrance animations wait on usePreloaderDone()
 * so they play in view instead of behind the curtain. Hard ceiling: the flag
 * flips on its own after 2.5s, so content can never stay hidden.
 */
let done = false;
const subscribers = new Set<() => void>();

export const markPreloaderDone = () => {
    if (done) return;
    done = true;
    subscribers.forEach((fn) => fn());
    subscribers.clear();
};

if (typeof window !== "undefined") window.setTimeout(markPreloaderDone, 2500);

export const usePreloaderDone = (): boolean => {
    const [isDone, setDone] = useState(done);

    useEffect(() => {
        if (done) {
            setDone(true);
            return;
        }
        const fn = () => setDone(true);
        subscribers.add(fn);
        return () => {
            subscribers.delete(fn);
        };
    }, []);

    return isDone;
};
