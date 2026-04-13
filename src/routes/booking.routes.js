// import express from "express";
// import {
//   createBooking,
//   // confirmPayment,
//   // getMyBookings,
//   getAllBookings,
//   getBookingById,
//   updateBookingStatus, 
//   deleteBooking  
// } from "../controllers/booking.controller.js";
// import { checkRole } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// router.post("/create",checkRole("USER"), createBooking); 
// // router.post("/confirm-payment", checkRole("USER"), confirmPayment);
// // router.get("/my-bookings", checkRole("USER"), getMyBookings);

// // Admin Routes
// router.get("/", getAllBookings); // Saari bookings dekhne ke liye
// router.get("/:id", getBookingById); // Ek booking ki detail
// router.patch("/status/:id", updateBookingStatus); // Status update (Confirmed/Cancelled)
// router.delete("/:id", deleteBooking); // Booking delete karne ke liye

// export default router;


import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus, 
  deleteBooking,
  getMyBookings   
} from "../controllers/booking.controller.js";
import { checkRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Create Booking: Ab USER aur ADMIN dono access kar sakte hain
router.post("/create", checkRole("USER", "ADMIN"), createBooking); 

// 🔒 Admin Only Routes: Sirf ADMIN access kar sakta hai
router.get("/", checkRole("ADMIN"), getAllBookings); 

// specific user booking
router.get("/my-bookings", checkRole("USER", "ADMIN"), getMyBookings);
// ℹ️ Get Details: ADMIN ko sab dikhega, 
// (Logic controller mein honi chahiye ki USER sirf apni booking dekh sake)
router.get("/:id", checkRole("ADMIN", "USER"), getBookingById); 

// 📝 Status Update: Sirf ADMIN (Confirmed/Cancelled karne ke liye)
router.patch("/status/:id", checkRole("ADMIN"), updateBookingStatus); 

// 🗑️ Delete: Sirf ADMIN
router.delete("/:id", checkRole("ADMIN"), deleteBooking); 

export default router;