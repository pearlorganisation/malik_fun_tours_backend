import express from "express";
import {
  createBooking,
  // confirmPayment,
  // getMyBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus, 
  deleteBooking  
} from "../controllers/booking.controller.js";
import { checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create",checkRole("USER"), createBooking); 
// router.post("/confirm-payment", checkRole("USER"), confirmPayment);
// router.get("/my-bookings", checkRole("USER"), getMyBookings);

// Admin Routes
router.get("/", getAllBookings); // Saari bookings dekhne ke liye
router.get("/:id", getBookingById); // Ek booking ki detail
router.patch("/status/:id", updateBookingStatus); // Status update (Confirmed/Cancelled)
router.delete("/:id", deleteBooking); // Booking delete karne ke liye

export default router;
