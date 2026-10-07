import common from "content/common/common.json";
import landing from "content/landing/landing-config.json";
import featuredProjects from "content/featured-projects/featured-projects-config.json";
import otherProjects from "content/other-projects/other-projects-config.json";
import about from "content/about/about-config.json";
import product from "content/kukuplay/product.json";

// Split out of Content.tsx (which pulls in react-markdown) so the always-loaded
// layer can import it: the JSON then lives once in the main bundle instead of
// being copied into every lazy section chunk that reads it.
export const configs = {
    common,
    landing,
    featuredProjects,
    otherProjects,
    about,
    /** The product Kratin builds — rename it (KukuPlay → PlayOshi) in product.json only. */
    product,
};

/** Swap the `{product}` token for the product's current name (KukuPlay → PlayOshi lives in product.json). */
export const withProduct = (text: string): string => text.split("{product}").join(configs.product.name);
