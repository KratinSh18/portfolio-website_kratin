import { FC, MouseEvent } from "react";

import { configs } from "shared/content/Content";
import { Marquee } from "shared/fx/Marquee";
import { Magnetic } from "shared/motion/Magnetic";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { Socials } from "shared/socials/Socials";
import { onMailTo } from "utils/Functions";

import "shared/footer/Footer.scss";

// Alternating solid / outlined words keep the band readable at a glance.
const BAND = ["Let's build something", "Say hi", "Let's build something", "Say hi"];

/**
 * The finale: a never-ending display band ("Let's build something"), the
 * contact block, then the small print. The band is the headline, so the
 * contact block opens with the kicker, not a second copy of those words.
 */
export const Footer: FC = () => {
    const reduced = useReducedMotion();
    const { email, name } = configs.common;

    // A real mailto link (copyable, keyboard-native) that still routes through the shared handler.
    const onEmail = (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        onMailTo();
    };
    const toTop = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });

    return (
        <footer className="finale">
            <div className="finale__band" aria-hidden="true">
                <Marquee
                    className="finale__marquee"
                    speed={36}
                    items={BAND.map((word, i) => (
                        <span className={i % 2 ? "finale__outline" : undefined}>{word}</span>
                    ))}
                />
            </div>

            <div className="finale__grid">
                <div>
                    <p className="finale__kicker fx-mono">
                        <span className="finale__line" aria-hidden="true" />
                        06 — Say hi
                    </p>
                    <h2 className="finale__accent">Got an idea, a product or a hard problem? Write to me.</h2>
                    <Magnetic strength={0.2}>
                        <a className="finale__email" href={`mailto:${email}`} onClick={onEmail} data-cursor="Write">
                            {email}
                        </a>
                    </Magnetic>
                </div>

                <div className="finale__side">
                    <Socials delay={100} exclude={["mail"]} resume={false} />
                    <Magnetic>
                        <button type="button" className="finale__top" onClick={toTop}>
                            Back to top
                            <span className="finale__arrow" aria-hidden="true">
                                ↑
                            </span>
                        </button>
                    </Magnetic>
                </div>
            </div>

            <div className="finale__print fx-mono">
                <span>Designed &amp; built by {name}</span>
                <span>&copy; {new Date().getFullYear()}</span>
            </div>
        </footer>
    );
};
