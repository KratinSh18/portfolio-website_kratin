import { FC, useState } from "react";

import { Accordion, AccordionItem } from "@chakra-ui/react";
import { configs } from "shared/content/Content";
import { Expandable } from "pages/about/common/expandable/Expandable";
import { ArticleTitle } from "pages/about/common/title/Title";

export const Education: FC = () => {
    const [educationExpanded, setEducationExpanded] = useState<number[]>([]);

    return (
        <>
            <ArticleTitle title="Education" />

            <Accordion pt="6" allowMultiple index={educationExpanded} id="education">
                {configs.about.educations.map((edu, idx) => (
                    <AccordionItem
                        key={`panel-${edu.school}-${edu.degree}`}
                        mb="4"
                        p={{ base: 5, md: 6 }}
                        bg="var(--fx-glass)"
                        border="1px solid var(--fx-glass-border)"
                        borderRadius="1.1rem"
                        boxShadow="var(--fx-glass-shadow)"
                        transition="border-color 0.45s var(--fx-ease-out)"
                        _hover={{ borderColor: "var(--fx-glass-border-hot)" }}
                        sx={{
                            backdropFilter: "blur(16px) saturate(135%)",
                            WebkitBackdropFilter: "blur(16px) saturate(135%)",
                        }}
                    >
                        <Expandable
                            title={edu.school}
                            subTitle={edu.degree}
                            date={edu.duration}
                            content={edu.content}
                            id={edu.id}
                            idx={idx}
                            onChange={setEducationExpanded}
                            expanded={educationExpanded}
                        />
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    );
};
