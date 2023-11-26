import { catchAsync } from "../utils/catch-async.js";
import { CustomError } from "../utils/custom-error.js";
import { storyService } from "../services/story.service.js";
class StoryController {
    create = catchAsync(async (req, res) => {
        const {
            body: { title, description, point, due, assigneeId, projectId },
            adminId
        } = req;
        if (!title || !projectId) {
            throw new CustomError(
                "All fields are required: Title, Description and Due date!",
                400
            );
        }
        const input = {
            title,
            description,
            point,
            due,
            assigneeId,
            projectId
        };
        const story = await storyService.create(input, adminId);
        res.status(200).json({
            data: story
        });
    });

    getOne = catchAsync(async (req, res) => {
        const {
            params: { id }
        } = req;
        const story = await storyService.getOne(id);
        res.status(200).json({
            data: story
        });
    });

    getAll = catchAsync(async (req, res) => {
        const { adminId, teamMember } = req;

        const stories = await storyService.getAll(adminId, teamMember);

        res.status(200).json({
            data: stories
        });
    });
}
export const storyController = new StoryController();
