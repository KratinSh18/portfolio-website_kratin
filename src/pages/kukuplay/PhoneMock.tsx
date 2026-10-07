import { FC, useEffect, useRef, useState } from "react";

import showcase from "content/kukuplay/showcase.json";
import { configs, withProduct } from "shared/content/Content";
import { usePauseOffscreen } from "shared/fx/usePauseOffscreen";
import { useReducedMotion } from "shared/motion/useReducedMotion";

interface Screen {
    src: string;
    alt: string;
}

// showcase.json "screens": [{ "src": "/assets/kukuplay/screen-chat.png", "alt": "..." }]
const screens = showcase.screens as Screen[];

/** A turn of play acted out in pure CSS: typing dots → narration → three choices → one gets picked. */
const MockChat: FC = () => {
    const { phone } = showcase;
    return (
        <div className="kp-chat">
            <div className="kp-chat__bar">
                <img className="kp-chat__avatar" src={configs.product.mark} alt="" width={32} height={32} />
                <div>
                    <p className="kp-chat__show">{phone.show}</p>
                    <p className="kp-chat__meta">{phone.meta}</p>
                </div>
            </div>
            <div className="kp-chat__turn">
                <span className="kp-chat__dots">
                    <i />
                    <i />
                    <i />
                </span>
                <p className="kp-chat__narr">{phone.narration}</p>
            </div>
            <div className="kp-chat__opts">
                {phone.options.map((option) => (
                    <span className="kp-chat__opt" key={option}>
                        {option}
                    </span>
                ))}
            </div>
            <div className="kp-chat__input">{phone.input}</div>
        </div>
    );
};

/**
 * CSS phone frame. With screenshots listed in showcase.json it cross-fades
 * through them; until then it plays the mock chat (decorative, so the frame
 * carries one descriptive label instead).
 */
export const PhoneMock: FC = () => {
    const reduced = useReducedMotion();
    const [shot, setShot] = useState(0);
    const ref = useRef<HTMLDivElement>(null);

    // the bob and the chat loop hold still while the phone is off-screen
    usePauseOffscreen(ref);

    useEffect(() => {
        if (reduced || screens.length < 2) return;
        const id = window.setInterval(() => {
            if (!document.hidden) setShot((s) => (s + 1) % screens.length);
        }, 3600);
        return () => window.clearInterval(id);
    }, [reduced]);

    const mock = screens.length === 0;

    return (
        <div
            ref={ref}
            className="kp-phone"
            role={mock ? "img" : undefined}
            aria-label={mock ? withProduct(showcase.phone.label) : undefined}
        >
            <span className="kp-phone__island" aria-hidden="true" />
            <div className="kp-phone__screen">
                {mock ? (
                    <MockChat />
                ) : (
                    screens.map((s, i) => (
                        <img
                            key={s.src}
                            className={`kp-phone__shot${i === shot ? " is-on" : ""}`}
                            src={s.src}
                            alt={withProduct(s.alt)}
                            aria-hidden={i !== shot}
                            loading="lazy"
                        />
                    ))
                )}
            </div>
        </div>
    );
};
