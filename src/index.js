import express from "express";
import { adminRouter } from "./routes/admin.route.js";
import dotenv from "dotenv";
import { GlobalError } from "./middlewares/global-error.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;

<<<<<<< HEAD
app.use("/admin", adminRouter);
app.use("/projects", projectRouter);
app.use("/team-members", teamMemberRouter);
=======
app.use("/users", userRouter);
>>>>>>> a05cbbd99603eaf0ed64600e1a11f77b263d7172
app.use(GlobalError.handle);

app.listen(PORT, () => {
    console.log("Server is running on", PORT);
});
