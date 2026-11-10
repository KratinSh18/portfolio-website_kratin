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
        // primary = the accent tokens: cream / charcoal in the chrome, the section's tone inside one
        solid: (props: any) =>
            props.colorScheme === "primary"
                ? {
                      bg: "var(--fx-accent)",
                      color: "var(--fx-on-accent)",
                      _hover: { bg: "var(--fx-accent-bright)", _disabled: { bg: "var(--fx-accent)" } },
                      _active: { bg: "var(--fx-accent)" },
                  }
                : { color: "white" },
        // link buttons ("Show more"): the accent as text, pressed too (Chakra's own
        // link variant merges in under this one and would press to primary.500/700)
        link: (props: any) =>
            props.colorScheme === "primary"
                ? { color: "var(--fx-ink-accent)", _active: { color: "var(--fx-ink-accent)" } }
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

// An underline marks a link; the colour is the accent (the section's tone inside one).
const LinkStyles: ComponentStyleConfig = {
    baseStyle: {
        fontWeight: 700,
        color: "var(--fx-ink-accent)",
        textDecoration: "underline",
        textDecorationThickness: "1px",
        textUnderlineOffset: "0.2em",
    },
};

export const components = {
    Text: { ...TextStyles },
    Container: { ...ContainerStyles },
    Link: { ...LinkStyles },
    Button: { ...ButtonStyles },
};
