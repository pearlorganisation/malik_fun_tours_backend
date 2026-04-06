import express from "express";
import {
  createAddon,
  updateAddon,
  getAllAddons,
  deleteAddon,
  getAddonById, 
} from "../controllers/addons.controller.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/", createAddon);
router.get("/", getAllAddons);
router.get("/:id", getAddonById);
router.patch("/:id", updateAddon);

router.delete("/:id", deleteAddon);

export default router;