import { ComponentStyleConfig } from "@chakra-ui/react";

const TextStyles: ComponentStyleConfig = {
    baseStyle: {
        fontWeight: 500,
    },
};

const ContainerStyles: ComponentStyleConfig = {
    baseStyle: {
        maxW: "container.xl",
    },
};

const ButtonStyles: ComponentStyleConfig = {
    baseStyle: {
        fontWeight: "bold",
    },
    variants: {
        // primary = a lime fill: near-black text (white on lime is ~1.3:1)
        solid: (props: any) =>
            props.colorScheme === "primary"
                ? {
                      bg: "primary.300",
                      color: "gray.900",
                      _hover: { bg: "primary.200", _disabled: { bg: "primary.300" } },
                      _active: { bg: "primary.400" },
                  }
                : { color: "white" },
        // link buttons ("Show more"): 500 is 2.7:1 on white, so the deep green there
        link: (props: any) =>
            props.colorScheme === "primary"
                ? { color: props.colorMode === "dark" ? "primary.300" : "primary.600" }
                : {},
        secondary: (props: any) => {
            return {
                color: props.colorMode === "dark" ? "white" : "gray.900",
                backgroundColor: props.colorMode === "dark" ? "gray.700" : "gray.50",
                _hover: {
                    backgroundColor: props.colorMode === "dark" ? "gray.600" : "gray.100",
                },
                _active: {
                    backgroundColor: props.colorMode === "dark" ? "gray.600" : "gray.200",
                },
            };
        },
        icon: (props: any) => {
            return {
                color: props.colorMode === "dark" ? "white" : "gray.900",
                background: "transparent",
                _hover: {
                    background: "transparent",
                    color: "var(--fx-accent)",
                },
                _focus: {
                    background: "transparent",
                },
                _active: {
                    background: "transparent",
                },
            };
        },
    },
    defaultProps: {
        variant: "solid",
    },
};

const LinkStyles: ComponentStyleConfig = {
    baseStyle: (props) => {
        let color = "primary.600";

        if (props.colorMode === "dark") color = "primary.300";

        return {
            fontWeight: 700,
            color,
        };
    },
};

export const components = {
    Text: { ...TextStyles },
    Container: { ...ContainerStyles },
    Link: { ...LinkStyles },
    Button: { ...ButtonStyles },
};
