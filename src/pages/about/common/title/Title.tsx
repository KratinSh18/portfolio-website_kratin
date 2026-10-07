import { FC } from "react";

import { Heading, StyleProps, Text } from "@chakra-ui/react";

interface Props extends StyleProps {
    title: string;
    id?: string;
}

/** Sub-section title inside About (Education, Skills): display face, crimson tick. */
export const ArticleTitle: FC<Props> = ({ title, id, ...props }) => {
    return (
        <Heading
            as="h3"
            id={id}
            fontFamily="var(--fx-font-display)"
            fontWeight="900"
            fontSize={{ base: "3xl", md: "4xl" }}
            lineHeight="1"
            letterSpacing="-0.01em"
            textTransform="uppercase"
            display="flex"
            alignItems="center"
            gap="0.9rem"
            _before={{
                content: '""',
                w: "2.25rem",
                h: "3px",
                borderRadius: "full",
                bg: "var(--fx-accent)",
                boxShadow: "var(--fx-glow-accent)",
            }}
            {...props}
        >
            {title}
        </Heading>
    );
};

export const SectionTitle: FC<Props> = ({ title, ...props }) => {
    return (
        <Text fontFamily="heading" fontWeight="700" fontSize="xl" lineHeight="1.2" {...props}>
            {title}
        </Text>
    );
};
