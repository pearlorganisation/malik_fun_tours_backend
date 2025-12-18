import express from "express";
import {  getMe } from "../controllers/user.controller.js";
import { authenticateToken, verifyPermission } from "../middlewares/authMiddleware.js";
import { USER_ROLES_ENUM } from "../../constants.js";

const userRouter = express.Router();

userRouter.get("/me", authenticateToken, verifyPermission([USER_ROLES_ENUM.ADMIN,USER_ROLES_ENUM.USER]), getMe);

export default userRouter;



