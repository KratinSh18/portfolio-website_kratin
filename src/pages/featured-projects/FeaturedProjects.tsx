import { FC } from "react";

import { FeaturedProjectCard, ImagePosition } from "pages/featured-projects/featured-project-card/FeaturedProjectCard";
import { HorizontalStage } from "pages/featured-projects/HorizontalStage";
import { configs } from "shared/content/Content";

export const FeaturedProjects: FC = () => {
    const projects = configs.featuredProjects;

    return (
        <HorizontalStage
            count={projects.length}
            ariaLabel="Featured projects"
            renderCard={(idx) => {
                const project = projects[idx];

                return (
                    <FeaturedProjectCard
                        key={idx}
                        imagePosition={idx % 2 === 0 ? ImagePosition.Right : ImagePosition.Left}
                        {...project}
                        description={
                            Array.isArray(project.description)
                                ? project.description.join(" ")
                                : project.description
                        }
                    />
                );
            }}
        />
    );
};
