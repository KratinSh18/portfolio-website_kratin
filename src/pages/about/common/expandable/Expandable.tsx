import { FC, useEffect, useState, useMemo } from "react";

import {
    Box,
    Button,
    AccordionButton,
    AccordionPanel,
    Text,
    Flex,
    UnorderedList,
    useColorModeValue,
} from "@chakra-ui/react";
import { SectionTitle } from "pages/about/common/title/Title";

interface Props {
    expanded: number[];
    idx: number;
    onChange: (expanded: number[]) => void;
    title: string;
    subTitle: string;
    date: string;
    content: string[];
    id: string;
}

export const Expandable: FC<Props> = ({ expanded, id, idx, title, subTitle, date, content, onChange }) => {
    const isExpanded = useMemo(() => expanded.includes(idx), [expanded, idx]);
    // readable crimson for the small mono date in each mode (AA on the glass)
    const dateColor = useColorModeValue("primary.700", "primary.200");
    const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
    // One toggle that stays mounted open or closed, so keyboard focus is never
    // dropped (a "See more" that unmounts on click sends focus back to <body>).
    const canExpand = content.length > 1 || isOverflowing;
    const toggle = () => onChange(isExpanded ? expanded.filter((e) => e !== idx) : [...expanded, idx]);

    useEffect(() => {
        const firstPointId = `first-point-${id}`;
        const element = document.getElementById(firstPointId);

        if (element) {
            if (element.scrollWidth >= element.parentElement?.scrollWidth!) {
                setIsOverflowing(true);
            } else {
                setIsOverflowing(false);
            }
        }
    }, [id]);

    return (
        <>
            <AccordionButton
                as={Box}
                p="0"
                disabled
                onClick={undefined}
                _hover={{ bg: "transparent" }}
                overflow="hidden"
                display="block"
            >
                <Text className="fx-mono" color={dateColor} fontSize="xs" fontWeight="700" mb="2">
                    {date}
                </Text>
                <SectionTitle title={title} />
                <Text color="var(--fx-text-soft)" fontWeight="600" pt="1">
                    {subTitle}
                </Text>
                <Flex pt="2" justifyContent="space-between">
                    {!isExpanded ? (
                        <Text id={`first-point-${id}`} isTruncated={!expanded.includes(idx)}>
                            {content[0]}
                        </Text>
                    ) : (
                        <UnorderedList listStylePosition="outside" pl="1">
                            <Text as="li" isTruncated={!expanded.includes(idx)}>
                                {content[0]}
                            </Text>
                        </UnorderedList>
                    )}
                    {canExpand && (
                        <Button
                            flexShrink={0}
                            id={`see-more-${id}`}
                            size="xs"
                            minH="40px"
                            variant="link"
                            colorScheme="gray"
                            opacity="0.8"
                            aria-expanded={isExpanded}
                            onClick={toggle}
                        >
                            {isExpanded ? "See less" : "See more"}
                        </Button>
                    )}
                </Flex>
            </AccordionButton>
            <AccordionPanel p="0" pl="1">
                <UnorderedList listStylePosition="outside">
                    {content.slice(1).map((cont, idx) => (
                        <Text as="li" key={`${title}-cont-${idx}`}>
                            {cont}
                        </Text>
                    ))}
                </UnorderedList>
            </AccordionPanel>
        </>
    );
};
