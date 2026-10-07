import { CSSProperties, FC, ReactNode, useRef } from "react";

import { usePauseOffscreen } from "shared/fx/usePauseOffscreen";

import "shared/fx/Marquee.scss";

interface Props {
    items: ReactNode[];
    /** Scroll left-to-right instead of right-to-left. */
    reverse?: boolean;
    /** Seconds for one full loop — bigger is slower. */
    speed?: number;
    separator?: ReactNode;
    className?: string;
}

/**
 * Seamless infinite ticker: the same group rendered twice, each sliding by its
 * own width (+ gap) so the seam never shows. Pure CSS, pauses on hover and
 * off-screen, static under reduced motion. The duplicate group is aria-hidden.
 */
export const Marquee: FC<Props> = ({ items, reverse = false, speed = 40, separator = "✦", className }) => {
    const ref = useRef<HTMLDivElement>(null);
    usePauseOffscreen(ref);

    const group = (hidden: boolean) => (
        <div className="marquee__group" aria-hidden={hidden || undefined}>
            {items.map((item, i) => (
                <span className="marquee__item" key={i}>
                    {item}
                    <span className="marquee__sep" aria-hidden="true">
                        {separator}
                    </span>
                </span>
            ))}
        </div>
    );

    return (
        <div
            ref={ref}
            className={`marquee${reverse ? " marquee--reverse" : ""}${className ? ` ${className}` : ""}`}
            style={{ "--marquee-dur": `${speed}s` } as CSSProperties}
        >
            {group(false)}
            {group(true)}
        </div>
    );
};
