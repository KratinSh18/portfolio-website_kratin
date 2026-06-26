import { FC } from "react";

import { Box, Flex, Heading, Text, Image } from "@chakra-ui/react";

import { configs, Content, MarkdownFile, useContent } from "shared/content/Content";
import { Education } from "pages/about/education/Education";
import { Skills } from "pages/about/skills/Skills";
import { Float3D } from "shared/motion/Float3D";

export const About: FC = () => {
    const content = useContent(MarkdownFile.About);

    return (
        <Box>
            <Float3D direction="up">
                <Flex pt="8" gap={{ base: 6, md: 6, lg: 12 }} direction={{ base: "column", md: "row" }}>
                    <Box flex="0.35">
                        <picture>
                            <source type="image/webp" srcSet={configs.common.mainPicture}></source>
                            <source type="image/jpeg" srcSet={configs.common.mainPictureJPG}></source>
                            <Image
                                borderRadius="xl"
                                src={configs.common.mainPicture}
                                w="100%"
                                alt="profile image"
                            />
                        </picture>
                    </Box>
                    <Box flex="0.85">
                        <Heading>{configs.common.name}</Heading>
                        <Flex alignItems="center">
                            <Text fontWeight="bold" opacity="0.5">
                                {configs.common.pronunciation}
                            </Text>
                        </Flex>
                        <Box pt="4">
                            <Content fontSize="lg">{content.about}</Content>
                        </Box>
                    </Box>
                </Flex>
            </Float3D>

            <Float3D direction="up">
                <Box mt="16" overflow="hidden">
                    <Education />
                </Box>
            </Float3D>

            <Float3D direction="up">
                <Box pt="16">
                    <Skills />
                </Box>
            </Float3D>
        </Box>
    );
};
