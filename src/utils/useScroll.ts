import { useEffect, useState } from "react";

export const WorkPageId = "page-work";
export const AboutPageId = "page-about";
// The product showcase; the WebGL background tints indigo while it is on screen.
// Lives here (main bundle) so the background and the hero can use it without
// pulling the lazy showcase chunk in.
export const KukuPlayShowcaseId = "page-kukuplay";

export enum Page {
    Work = "work",
    About = "about",
}

const pageIds = [WorkPageId, AboutPageId];

/**
 * The page whose box spans the top edge of the viewport ("" for none), for the
 * nav highlight. An IntersectionObserver on a thin band at the top, so scrolling
 * never reads layout or sets state per event (the old handler read offsetTop on
 * every scroll event, forcing a layout mid-frame). The pages share the nav's
 * Suspense boundary, so they exist by the time this mounts.
 */
export const useScroll = () => {
    const [page, setPage] = useState<string>("");

    useEffect(() => {
        if (typeof IntersectionObserver === "undefined") return;
        const inBand = new Set<string>();
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => (e.isIntersecting ? inBand.add(e.target.id) : inBand.delete(e.target.id)));
                setPage(pageIds.find((id) => inBand.has(id)) || "");
            },
            { rootMargin: "0px 0px -99% 0px" },
        );
        pageIds.forEach((id) => {
            const el = document.getElementById(id);
            if (el) io.observe(el);
        });
        return () => io.disconnect();
    }, []);

    return page;
};
