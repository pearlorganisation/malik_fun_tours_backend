import express from "express";
import {
  createPlace,
  getAllPlaces,
  getPlaceById,
  updatePlace,
  deletePlace,
} from "../controllers/place.controller.js";
import { upload } from "../middlewares/multer.js";

const router = express.Router();

router.post("/", upload.single("heroImage"), createPlace);
router.get("/", getAllPlaces);
router.get("/:id", getPlaceById);
router.put("/:id", upload.single("heroImage"), updatePlace);
router.delete("/:id", deletePlace);

export default router;
