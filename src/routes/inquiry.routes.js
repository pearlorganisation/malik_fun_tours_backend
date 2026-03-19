import express from "express";
import { createInquiry } from "../controllers/inquiryController.js";

const router = express.Router();

router.post("/create", createInquiry);

export default router;