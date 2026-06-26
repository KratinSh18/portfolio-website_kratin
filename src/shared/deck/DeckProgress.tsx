import { FC } from "react";

import { Box, HStack } from "@chakra-ui/react";

interface Props {
    count: number;
    index: number;
    onDot: (index: number) => void;
}

export const DeckProgress: FC<Props> = ({ count, index, onDot }) => (
    <HStack spacing="3" justifyContent="center">
        {Array.from({ length: count }, (_, i) => (
            <Box
                as="button"
                key={i}
                type="button"
                aria-label={`Go to project ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => onDot(i)}
                h="3"
                w={i === index ? "8" : "3"}
                borderRadius="full"
                bg={i === index ? "primary.500" : "gray.400"}
                opacity={i === index ? 1 : 0.5}
                transition="all 0.3s ease"
                _hover={{ opacity: 1 }}
            />
        ))}
    </HStack>
);
