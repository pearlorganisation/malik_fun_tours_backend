import express from "express";
import { register,verifyOTP,resendOTP ,login,logout,forgotPassword,resetPassword} from "../controllers/auth/auth.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(`/register`,register);
router.post(`/verify-otp`,verifyOTP)
router.post(`/resend-otp`,resendOTP);
router.post(`/login`, login);
router.post(`/logout`, authenticateToken, logout);
router.post(`/forgot-password`,forgotPassword)
router.patch('/reset-password',resetPassword)


export default router;
