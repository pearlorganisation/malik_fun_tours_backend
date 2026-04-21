// import express from "express";
// import {
//   createHotel,
//   getAllHotels,
//   getHotelById,
//   updateHotel,
//   deleteHotel,
// } from "../controllers/hotel.controller.js";

// import { authenticateToken } from "../middlewares/authMiddleware.js";

// const router = express.Router();

// router.post("/", authenticateToken, createHotel);
// router.get("/", getAllHotels);
// router.get("/:id", getHotelById);
// router.patch("/:id", authenticateToken, updateHotel);
// router.delete("/:id", authenticateToken, deleteHotel);

// export default router;


import express from "express";

import {
  createHotel,
  getAllHotels,
  getHotelById,
  updateHotel,
  deleteHotel,

  // 🔥 NEW CONTROLLERS
  searchHotels,
  addReview,
  getTopHotels,
  getNearbyHotels,
  softDeleteHotel,
} from "../controllers/hotel.controller.js";

import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * 🏨 BASIC CRUD
 */
router.post("/", authenticateToken, createHotel);
router.get("/", getAllHotels);
router.get("/:id", getHotelById);
router.patch("/:id", authenticateToken, updateHotel);
router.delete("/:id", authenticateToken, deleteHotel);

/**
 * 🔍 SEARCH + FILTER + PAGINATION
 * example: /api/hotels/search?search=delhi&page=1&limit=10
 */
router.get("/search/all", searchHotels);

/**
 * ⭐ ADD REVIEW
 */
router.post("/:id/review", authenticateToken, addReview);

/**
 * 🏆 TOP HOTELS
 */
router.get("/top/featured", getTopHotels);

/**
 * 📍 NEARBY HOTELS
 * example: /api/hotels/nearby?lat=28.6&lng=77.2
 */
router.get("/nearby/location", getNearbyHotels);

/**
 * 🗑️ SOFT DELETE
 */
router.patch("/:id/soft-delete", authenticateToken, softDeleteHotel);

export default router;