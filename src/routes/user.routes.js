import express from "express";
import { getAllUsers } from "../controllers/user.controller.js";
const userRouter = express.Router();
import { checkRole } from "../middlewares/authMiddleware.js";

userRouter.get("/", getAllUsers);

export default userRouter;
