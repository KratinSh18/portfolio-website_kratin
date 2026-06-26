import { FC } from "react";

import { Box, HStack, Text } from "@chakra-ui/react";

interface Props {
    id?: string;
    label: string;
}

export const PageHeader: FC<Props> = ({ id, label }) => {
    return (
        <Box id={id} pt={{ base: "24", md: "32" }} pb="10">
            <HStack spacing="3" mb="3" className="fx-mono" color="primary.400" fontSize="xs">
                <Box w="2.5rem" h="2px" bg="primary.500" borderRadius="full" />
                <Text as="span" letterSpacing="0.22em">
                    Section
                </Text>
            </HStack>
            <Text
                as="span"
                className="fx-gradient-text"
                fontSize={{ base: "4xl", md: "6xl" }}
                fontFamily="heading"
                fontWeight="800"
                lineHeight="1"
                textTransform="capitalize"
                display="inline-block"
            >
                {label}
            </Text>
        </Box>
    );
};
