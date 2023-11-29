import express from "express";
import { adminRouter } from "./routes/admin.route.js";
import dotenv from "dotenv";
import { GlobalError } from "./middlewares/global-error.middleware.js";
import { projectRouter } from "./routes/project.route.js";
import { teamMemberRouter } from "./routes/team-member.route.js";
import { storyRouter } from "./routes/story.route.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4040;

app.use("/admin", adminRouter);
app.use("/projects", projectRouter);
app.use("/team-members", teamMemberRouter);
app.use("/stories", storyRouter);
app.use(GlobalError.handle);

app.listen(PORT, () => {
    console.log("Server is running on", PORT);
});
