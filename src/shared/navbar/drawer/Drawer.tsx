import { FC, useRef } from "react";

import {
    Box,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    IconButton,
    StyleProps,
    Flex,
    HStack,
    Text,
    VStack,
    useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { HiMenuAlt4 } from "react-icons/hi";

import { ColorModeButton } from "shared/color-mode-button/ColorModeButton";
import { AboutPageId, WorkPageId } from "utils/useScroll";
import { Socials } from "shared/socials/Socials";
import { onResumeOpen } from "utils/Functions";
import { useReducedMotion } from "shared/motion/useReducedMotion";

interface Props extends StyleProps {
    onSectionClick: (section: string) => void;
    currentPage: string;
}

/** Mobile menu: a full-screen frosted sheet with big display-type links that rise in one after another. */
export const MenuDrawer: FC<Props> = ({ onSectionClick, currentPage, ...props }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = useRef<HTMLButtonElement>(null);
    const reduced = useReducedMotion();
    const color = useColorModeValue("gray.800", "white");

    // close first, then scroll once the sheet is out of the way
    const toSection = (section: string) => {
        onClose();
        setTimeout(() => onSectionClick(section), 250);
    };

    const items = [
        { label: "Work", cursor: "Go", active: currentPage === WorkPageId, onClick: () => toSection(WorkPageId) },
        { label: "About", cursor: "Go", active: currentPage === AboutPageId, onClick: () => toSection(AboutPageId) },
        { label: "Resume", cursor: "Open", active: false, onClick: onResumeOpen },
    ];

    return (
        <Box {...props}>
            <IconButton
                ref={btnRef}
                variant="icon"
                onClick={onOpen}
                aria-label="Open menu"
                aria-expanded={isOpen}
                fontSize="2xl"
                w="40px"
                h="40px"
                minW="40px"
                icon={<HiMenuAlt4 />}
            />
            <Drawer
                isOpen={isOpen}
                placement="right"
                size="full"
                onClose={onClose}
                autoFocus={false}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay bg="blackAlpha.500" />
                <DrawerContent
                    bg="var(--fx-glass-strong)"
                    sx={{ backdropFilter: "blur(22px) saturate(140%)", WebkitBackdropFilter: "blur(22px) saturate(140%)" }}
                >
                    <DrawerHeader px="5" pt="5">
                        <Flex justifyContent="space-between" alignItems="center">
                            <Text as="span" className="fx-mono" fontSize="xs" color="var(--fx-text-soft)">
                                Menu
                            </Text>
                            <HStack spacing="2">
                                <ColorModeButton />
                                <DrawerCloseButton
                                    position="relative"
                                    top="0"
                                    right="0"
                                    w="40px"
                                    h="40px"
                                    borderRadius="full"
                                />
                            </HStack>
                        </Flex>
                    </DrawerHeader>

                    <DrawerBody px="5" display="flex" flexDirection="column" justifyContent="center">
                        <VStack as="nav" aria-label="Primary" alignItems="flex-start" spacing="1">
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={reduced ? false : { y: 48, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 140, damping: 18, delay: 0.1 + i * 0.07 }}
                                >
                                    <Box
                                        as="button"
                                        type="button"
                                        data-cursor={item.cursor}
                                        aria-current={item.active ? "true" : undefined}
                                        onClick={item.onClick}
                                        display="flex"
                                        alignItems="baseline"
                                        gap="3"
                                        py="1"
                                        color={item.active ? "primary.500" : color}
                                        transition="color 0.3s var(--fx-ease-out)"
                                        _hover={{ color: "primary.500" }}
                                        _focusVisible={{ outline: "2px solid var(--fx-accent-bright)", outlineOffset: "4px" }}
                                    >
                                        <Text as="span" className="fx-mono" fontSize="xs" color="var(--fx-text-soft)">
                                            0{i + 1}
                                        </Text>
                                        <Text
                                            as="span"
                                            fontFamily="var(--fx-font-display)"
                                            fontWeight="900"
                                            fontSize="clamp(2.75rem, 14vw, 4.5rem)"
                                            lineHeight="1"
                                            letterSpacing="-0.02em"
                                            textTransform="uppercase"
                                        >
                                            {item.label}
                                        </Text>
                                    </Box>
                                </motion.div>
                            ))}
                        </VStack>

                        <motion.div
                            initial={reduced ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.35 }}
                        >
                            <Box mt="12">
                                <Socials delay={100} resume={false} />
                            </Box>
                        </motion.div>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};
