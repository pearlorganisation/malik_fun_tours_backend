import express from "express";
import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,
} from "../controllers/hotel.controller.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticateToken, createHotel);
router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.patch("/:id", authenticateToken, updateHotel);
router.delete("/:id", authenticateToken, deleteHotel);

export default router;