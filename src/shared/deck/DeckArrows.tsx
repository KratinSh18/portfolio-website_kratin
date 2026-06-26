import { FC } from "react";

import { IconButton } from "@chakra-ui/react";

import { ChevronLeftIcon, ChevronRightIcon } from "utils/Icons";

interface Props {
    side: "prev" | "next";
    disabled: boolean;
    onClick: () => void;
}

export const DeckArrows: FC<Props> = ({ side, disabled, onClick }) => (
    <IconButton
        aria-label={side === "prev" ? "Previous project" : "Next project"}
        icon={side === "prev" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        onClick={onClick}
        isDisabled={disabled}
        variant="secondary"
        isRound
        size="md"
        fontSize="xl"
        display={{ base: "none", md: "inline-flex" }}
    />
);
