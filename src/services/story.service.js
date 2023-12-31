import { prisma } from "../prisma/index.js";
import { projectService } from "./project.service.js";
import { CustomError } from "../utils/custom-error.js";

class StoryService {
    create = async (input, adminId) => {
        await projectService.isProjectBelongsToAdmin(input.projectId, adminId);
        const story = await prisma.story.create({
            data: input
        });
        return story;
    };

    getOne = async (id) => {
        const story = await prisma.story.findUnique({
            where: {
                id: id
            }
        });
        if (!story) {
            throw new CustomError("Story does not exist", 404);
        }

        return story;
    };
    getAll = async (projectId, adminId) => {
        await projectService.isProjectBelongsToAdmin(projectId, adminId);

        const stories = await prisma.story.findMany({
            where: {
                projectId: projectId
            }
        });

        return stories;
    };

    update = async (id, assigneeId, update) => {
        await prisma.story.update({
            where: {
                id: id,
                assigneeId: assigneeId
            },
            data: {
                ...update
            }
        });
    };

    // isStoryBelongsToTeamMember = async (id, teamMember) => {
    //     const story = await prisma.story.findUnique({
    //         where: {
    //             id
    //         }
    //     });

    //     if (!story) {
    //         throw new CustomError("Story does not exist", 404);
    //     }
    //     if (teamMember.id !== story.assigneeId) {
    //         throw new CustomError("This story does not belong to you", 400);
    //     }
    // };
}

export const storyService = new StoryService();
