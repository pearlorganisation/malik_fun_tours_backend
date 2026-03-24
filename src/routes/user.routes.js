import express from "express";
import { getAllUsers,getUserById } from "../controllers/user.controller.js";
const userRouter = express.Router();
import { checkRole } from "../middlewares/authMiddleware.js";

userRouter.get("/", getAllUsers);
userRouter.get("/:id", getUserById);

export default userRouter;
