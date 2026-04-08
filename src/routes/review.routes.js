import express from "express";
import {
  createReview,
  updateReview,
  getActivityReviews,
  deleteReview,
    getAllReviews,
  getReviewStats,
} from "../controllers/review.controller.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// router.post("/", createReview);
// router.put("/:id",authenticateToken, updateReview);
// router.delete("/:id",authenticateToken, deleteReview);
router.post("/", authenticateToken, createReview); 
router.put("/:id", authenticateToken, updateReview);
router.delete("/:id", authenticateToken, deleteReview);

router.get("/activity/:activityId", getActivityReviews);
// All reviews (pagination)
router.get("/all", getAllReviews);
// Only stats
router.get("/stats", getReviewStats);
export default router;
