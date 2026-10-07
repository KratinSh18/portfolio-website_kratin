import { CSSProperties, FC, useEffect, useRef } from "react";

import { IconType } from "react-icons";
import { FaAndroid, FaApple, FaBrain, FaChartLine, FaCreditCard, FaPenNib, FaReact, FaShieldAlt } from "react-icons/fa";

import showcase from "content/kukuplay/showcase.json";
import { configs, withProduct } from "shared/content/Content";

const chapterIcons: Record<string, IconType> = {
    engine: FaBrain,
    android: FaAndroid,
    ios: FaApple,
    web: FaReact,
    payments: FaCreditCard,
    growth: FaChartLine,
    studio: FaPenNib,
    safety: FaShieldAlt,
};

/** Chapter id (showcase.json) → icon; an unknown id still gets a node. */
export const iconFor = (id: string): IconType => chapterIcons[id] || FaBrain;

// Visual tuning, not content: radius as a fraction of the orbit size, the 3D
// tilt of each ring's plane, one spin period and alternating directions so the
// rings drift against each other.
const RINGS = [
    { rf: 0.27, tx: 68, ty: -12, dur: 70, dir: "normal", offset: 20 },
    { rf: 0.37, tx: 63, ty: 14, dur: 95, dir: "reverse", offset: 75 },
    { rf: 0.45, tx: 72, ty: -5, dur: 120, dir: "normal", offset: 140 },
];

interface Props {
    chapters: { id: string; title: string }[];
    /** Index of the lit chapter, or -1 for none (static layout). */
    active: number;
    /** Spinning, sticky desktop version; false = smaller and still. */
    live: boolean;
    onSelect: (index: number) => void;
}

/**
 * The product mark in a glowing core, circled by tilted rings with one node
 * per chapter. All motion is CSS on the compositor: each ring spins in its own
 * 3D plane and its nodes counter-rotate so the icons always face the viewer.
 * Chapters fill the rings in order (inner first), so DOM / tab order matches
 * the reading order of the cards.
 */
export const ShowcaseOrbit: FC<Props> = ({ chapters, active, live, onSelect }) => {
    const ref = useRef<HTMLDivElement>(null);

    // Pause the spin while the orbit is off-screen — a class flip, no re-render.
    useEffect(() => {
        const el = ref.current;
        if (!live || !el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(([entry]) => el.classList.toggle("is-paused", !entry.isIntersecting));
        io.observe(el);
        return () => io.disconnect();
    }, [live]);

    const n = chapters.length;
    const ringOf = (i: number) => Math.min(RINGS.length - 1, Math.floor((i * RINGS.length) / n));
    const placed = chapters.map((chapter, i) => {
        const ring = ringOf(i);
        const first = chapters.findIndex((_, j) => ringOf(j) === ring);
        const count = chapters.filter((_, j) => ringOf(j) === ring).length;
        return { ...chapter, i, ring, angle: RINGS[ring].offset + (360 / count) * (i - first) };
    });
    const lit = active >= 0 ? placed[active] : undefined;

    return (
        <div
            ref={ref}
            className={`kp-orbit ${live ? "kp-orbit--live" : "kp-orbit--static"}`}
            role="group"
            aria-label={showcase.orbitLabel}
        >
            <span className="kp-orbit__glow" aria-hidden="true" />
            <div className="kp-orbit__stage">
                {RINGS.map((ring, r) => (
                    <div
                        key={r}
                        className="kp-orbit__ring"
                        style={
                            {
                                "--rf": ring.rf,
                                "--tx": `${ring.tx}deg`,
                                "--ty": `${ring.ty}deg`,
                                "--dur": `${ring.dur}s`,
                                "--dir": ring.dir,
                            } as CSSProperties
                        }
                    >
                        <svg className="kp-orbit__svg" viewBox="0 0 100 100" aria-hidden="true">
                            <circle className="kp-orbit__track" cx="50" cy="50" r="49" pathLength={100} />
                            <circle className="kp-orbit__arc" cx="50" cy="50" r="49" pathLength={100} />
                        </svg>

                        {lit && lit.ring === r && (
                            <span
                                className="kp-orbit__beam"
                                style={{ "--a": `${lit.angle}deg` } as CSSProperties}
                                aria-hidden="true"
                            />
                        )}

                        {placed
                            .filter((p) => p.ring === r)
                            .map((p) => {
                                const Icon = iconFor(p.id);
                                const isActive = p.i === active;
                                return (
                                    <span
                                        key={p.id}
                                        className="kp-orbit__slot"
                                        style={{ "--a": `${p.angle}deg` } as CSSProperties}
                                    >
                                        <button
                                            type="button"
                                            className={`kp-node${isActive ? " is-active" : ""}`}
                                            onClick={() => onSelect(p.i)}
                                            aria-label={`${showcase.chapterWord} ${p.i + 1}: ${withProduct(p.title)}`}
                                            aria-current={isActive ? "step" : undefined}
                                            data-cursor="Go"
                                        >
                                            <span className="kp-node__disc" aria-hidden="true">
                                                <Icon />
                                            </span>
                                        </button>
                                    </span>
                                );
                            })}
                    </div>
                ))}

                <span className="kp-orbit__core" aria-hidden="true">
                    <img src={configs.product.mark} alt="" width={160} height={160} />
                </span>
            </div>
        </div>
    );
};
