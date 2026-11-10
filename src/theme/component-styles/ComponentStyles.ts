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
        // primary = cream fill + near-black text on dark, charcoal fill + paper text on light
        solid: (props: any) =>
            props.colorScheme === "primary"
                ? props.colorMode === "dark"
                    ? {
                          bg: "primary.100",
                          color: "gray.900",
                          _hover: { bg: "primary.50", _disabled: { bg: "primary.100" } },
                          _active: { bg: "primary.200" },
                      }
                    : {
                          bg: "primary.900",
                          color: "gray.50",
                          _hover: { bg: "primary.700", _disabled: { bg: "primary.900" } },
                          _active: { bg: "primary.800" },
                      }
                : { color: "white" },
        // link buttons ("Show more"): cream on dark, charcoal on light
        link: (props: any) =>
            props.colorScheme === "primary"
                ? { color: props.colorMode === "dark" ? "primary.100" : "primary.900" }
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

// Colour no longer marks a link (the page is monochrome), so an underline does.
const LinkStyles: ComponentStyleConfig = {
    baseStyle: (props) => ({
        fontWeight: 700,
        color: props.colorMode === "dark" ? "primary.100" : "primary.900",
        textDecoration: "underline",
        textDecorationThickness: "1px",
        textUnderlineOffset: "0.2em",
    }),
};

export const components = {
    Text: { ...TextStyles },
    Container: { ...ContainerStyles },
    Link: { ...LinkStyles },
    Button: { ...ButtonStyles },
};
