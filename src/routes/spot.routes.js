import express from "express";
import {
  createSpot,
  getAllSpots,
  getSpotById,
  updateSpot,
  deleteSpot,
} from "../controllers/spot.controller.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/", upload.single("image"), createSpot);
router.get("/", getAllSpots);
router.get("/:id", getSpotById);
router.put("/:id", upload.single("image"), updateSpot);
router.delete("/:id", deleteSpot);

export default router;
