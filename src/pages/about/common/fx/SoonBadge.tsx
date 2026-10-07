import { FC } from "react";

import { configs } from "shared/content/Content";

import "pages/about/common/fx/SoonBadge.scss";

/**
 * "soon {nextName}" — shown next to the product name only while product.json says
 * so (showNextName), so the rename stays a one-line change there.
 */
export const SoonBadge: FC = () => {
    if (!configs.product.showNextName) return null;

    return (
        <span className="fx-chip fx-mono about-soon">
            soon {configs.product.nextName}
        </span>
    );
};
