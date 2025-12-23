import express from "express";
import {
  register,
  verifyOTP,
  resendOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  getProfile,
} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

//test commit
router.post(`/register`, register);
router.post(`/verify-otp`, verifyOTP);
router.post(`/resend-otp`, resendOTP);
router.post(`/login`, login);
router.post(`/logout`, authenticateToken, logout);
router.post(`/forgot-password`, forgotPassword);
router.patch("/reset-password", resetPassword);
router.get("/me", authenticateToken, getProfile);
router.patch("/update-profile", authenticateToken, updateProfile);

export default router;
