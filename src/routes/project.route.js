import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { projectController } from "../controllers/project.controller.js";

const projectRouter = Router();

projectRouter.post(
    "/contributors/add",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.addContributor
);

projectRouter.patch(
    "/contributors/deactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.deactivateContributor
);

projectRouter.patch(
    "/contributors/reactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.reactivateContributor
);

projectRouter.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.create
);
projectRouter.get(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getOne
);
projectRouter.patch(
    "/:id",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.update
);
projectRouter.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.getAll
);

projectRouter.patch(
    "/:id/change-status",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    projectController.changeStatus
);

export { projectRouter };
