import { FC } from "react";

import { Flex, Box, Badge } from "@chakra-ui/react";

interface Props {
    id: string;
    tags: Array<string>;
    size?: string;
    delay?: number;
}

export const Tags: FC<Props> = ({ id, tags, size = "sm" }) => {
    return (
        <Flex py="2" wrap="wrap" gap="4">
            {tags.map((tag) => (
                <Box key={`${id}-tag-${tag}`}>
                    <Badge
                        transition="0.25s ease-in-out"
                        transitionProperty="background, color, box-shadow, border-color"
                        bg="var(--fx-glass)"
                        color="inherit"
                        border="1px solid var(--fx-glass-border)"
                        _hover={{
                            color: "primary.400",
                            borderColor: "var(--fx-glass-border-hot)",
                            transform: "translateY(-1px)",
                        }}
                        textTransform="none"
                        borderRadius="full"
                        px="10px"
                        py="4px"
                        fontSize={size}
                        fontWeight="600"
                    >
                        {tag}
                    </Badge>
                </Box>
            ))}
        </Flex>
    );
};
