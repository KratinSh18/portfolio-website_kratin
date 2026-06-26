import { FC } from "react";

import "shared/fx/AuroraBackground.scss";

/**
 * Subtle, professional ambient backdrop — soft brand-tinted gradient clouds that
 * drift slowly behind a faint grid. Pure CSS (themed + reduced-motion aware in
 * the stylesheet), so it's cheap and lets the content stay the focus.
 */
export const AuroraBackground: FC = () => (
    <div className="fx-aurora" aria-hidden="true">
        <div className="fx-aurora__clouds" />
        <div className="fx-aurora__grid" />
        <div className="fx-aurora__vignette" />
    </div>
);
