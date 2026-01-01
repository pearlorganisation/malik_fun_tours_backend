import express from "express";
import {
  createReview,
  updateReview,
  getActivityReviews,
  deleteReview,
} from "../controllers/review.controller.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/",authenticateToken, createReview);
router.get("/activity/:activityId", getActivityReviews);
router.put("/:id",authenticateToken, updateReview);
router.delete("/:id",authenticateToken, deleteReview);

export default router;
