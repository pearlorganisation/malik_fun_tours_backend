import express from "express";
import {
  createBooking,
  confirmPayment,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/create", createBooking);
router.post("/confirm-payment", confirmPayment);

export default router;
