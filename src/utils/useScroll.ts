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

export const useScroll = () => {
    const [page, setPage] = useState<string>("");

    const scrollHandler = () => {
        const documentTop = document.scrollingElement?.scrollTop!;
        const pages = pageIds.map((page) => document.getElementById(page));
        let newPage = "";

        pages.forEach((page) => {
            if (page) {
                const top = page.offsetTop;
                const height = page.clientHeight;

                if (top < documentTop && top + height > documentTop) {
                    newPage = page.id;
                }
            }
        });

        setPage(newPage);
    };

    useEffect(() => {
        const timeout = setTimeout(scrollHandler, 100);

        document.addEventListener("scroll", scrollHandler, { passive: true });

        return () => {
            clearTimeout(timeout);
            // remove the SAME reference (the old code removed a fresh () => {}, leaking the listener)
            document.removeEventListener("scroll", scrollHandler);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return page;
};
