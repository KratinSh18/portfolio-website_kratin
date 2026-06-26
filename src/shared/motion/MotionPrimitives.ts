import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";

/**
 * Created once at module scope. Re-creating `motion(Box)` on every render
 * remounts the underlying DOM node and drops in-flight animations.
 */
export const MotionBox = motion(Box);
