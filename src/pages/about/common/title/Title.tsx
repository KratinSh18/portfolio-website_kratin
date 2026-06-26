import { FC } from "react";

import { Heading, StyleProps, Text } from "@chakra-ui/react";

interface Props extends StyleProps {
    title: string;
}

export const ArticleTitle: FC<Props> = ({ title, ...props }) => {
    return (
        <Heading fontSize="2xl" fontWeight="bold" {...props}>
            {title}
        </Heading>
    );
};

export const SectionTitle: FC<Props> = ({ title, ...props }) => {
    return (
        <Text fontWeight="semibold" fontSize="lg" {...props}>
            {title}
        </Text>
    );
};
