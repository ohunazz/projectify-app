import { catchAsync } from "../utils/catch-async";

class StoryController {
    create = catchAsync(async (req, res) => {
        const {
            body: { title, description, point, due, assigneeId, projectId }
        } = req;
    });
}
