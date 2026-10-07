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
                        // transform rides a back-out curve: one small overshoot, then settles
                        transition="background 0.25s ease, color 0.25s ease, border-color 0.25s ease, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)"
                        bg="var(--fx-glass)"
                        color="inherit"
                        border="1px solid var(--fx-glass-border)"
                        _hover={{
                            color: "primary.400",
                            borderColor: "var(--fx-glass-border-hot)",
                            transform: "translateY(-2px) scale(1.05)",
                        }}
                        sx={{ "@media (prefers-reduced-motion: reduce)": { "&:hover": { transform: "none" } } }}
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
