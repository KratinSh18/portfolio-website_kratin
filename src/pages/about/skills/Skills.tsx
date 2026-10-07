import { FC } from "react";

import { motion } from "framer-motion";

import { configs } from "shared/content/Content";
import { useReducedMotion } from "shared/motion/useReducedMotion";
import { ArticleTitle } from "pages/about/common/title/Title";
import { glare } from "pages/about/common/fx/glare";

import "pages/about/skills/Skills.scss";

const chips = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } },
};

const chip = {
    hidden: { opacity: 0, y: 14, scale: 0.9 },
    shown: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 140, damping: 18 } },
};

/**
 * Skill groups as a bento of glass panels: a giant outlined group number, chips
 * that stagger in when the panel scrolls into view and spring on hover. The
 * hover transform lives on an inner span because framer owns the <li>'s
 * inline transform. Reduced motion renders the chips in place.
 */
export const Skills: FC = () => {
    const reduced = useReducedMotion();
    const trigger = reduced
        ? {}
        : { variants: chips, initial: "hidden", whileInView: "shown", viewport: { once: true, amount: 0.3 } };

    return (
        <section aria-labelledby="skills-title">
            <ArticleTitle id="skills-title" title="Skills" />

            <div className="skl">
                {configs.about.skills.map((group, i) => (
                    <article className="skl__panel fx-glass" key={group.title} onPointerMove={glare}>
                        <span className="skl__num" aria-hidden="true">{`0${i + 1}`}</span>
                        <h4 className="skl__title">{group.title}</h4>
                        <p className="skl__count fx-mono">{group.tools.length} skills</p>
                        {/* keyed on `reduced` so turning motion off remounts the chips visible */}
                        <motion.ul key={reduced ? "still" : "moving"} className="skl__chips" {...trigger}>
                            {group.tools.map((tool) => (
                                <motion.li key={tool} variants={reduced ? undefined : chip}>
                                    <span className="skl__chip">{tool}</span>
                                </motion.li>
                            ))}
                        </motion.ul>
                    </article>
                ))}
            </div>
        </section>
    );
};
