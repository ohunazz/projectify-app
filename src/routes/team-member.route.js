import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { teamMemberController } from "../controllers/team-member.controller.js";

const teamMemberRouter = new Router();

teamMemberRouter.post(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.create
);

teamMemberRouter.patch("/create-password", teamMemberController.createPassword);

teamMemberRouter.get(
    "/",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.getAll
);

teamMemberRouter.patch(
    "/:id/deactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.deactivate
);

teamMemberRouter.patch(
    "/:id/reactivate",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.reactivate
);

teamMemberRouter.patch(
    "/:id/change-password",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.changePasswordByAdmin
);

teamMemberRouter.delete(
    "/:id/delete",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.delete
);

teamMemberRouter.patch(
    "/:id/update",
    authMiddleware.authenticate,
    authMiddleware.isAdmin,
    teamMemberController.update
);

teamMemberRouter.post("/login", teamMemberController.login);
teamMemberRouter.patch("/forgot-password", teamMemberController.forgotPassword);
teamMemberRouter.patch("/reset-password", teamMemberController.resetPassword);

export { teamMemberRouter };
