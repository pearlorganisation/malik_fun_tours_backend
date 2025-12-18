import express from "express";
import {
  createBooking,
  confirmPayment,
  getMyBookings,
} from "../controllers/booking.controller.js";
import { checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create",checkRole("USER"), createBooking);
router.post("/confirm-payment",checkRole("USER"), confirmPayment);
router.get("/my-bookings",checkRole("USER"), getMyBookings);

export default router;
