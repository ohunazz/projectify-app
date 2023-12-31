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
        const { params, adminId } = req;
        const stories = await storyService.getAll(params.projectId, adminId);
        res.status(200).json({
            data: stories
        });
    });

    update = catchAsync(async (req, res) => {
        const { body, assigneeId, params } = req;
        const update = {};

        if (body.title) {
            update.title = body.title;
        }
        if (body.description) {
            update.description = body.description;
        }
        if (body.point) {
            update.point = body.point;
        }
        if (body.due) {
            update.due = body.due;
        }
        if (
            !update.title &&
            !update.description &&
            !update.point &&
            !update.due
        ) {
            throw new CustomError("No update data provided", 400);
        }

        await storyService.update(params.id, assigneeId, update);
        res.status(204).send();
    });

    archive = catchAsync(async (req, res) => {
        const { params } = req;

        await storyService.changeStatus(params.id, "ARCHIVED");
        res.status(204).send();
    });
}
export const storyController = new StoryController();
