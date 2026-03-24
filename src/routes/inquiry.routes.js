import express from "express";
import { 
  createInquiry, 
  getAllInquiries, 
  getInquiryById, 
  updateInquiryStatus, 
  deleteInquiry 
} from "../controllers/inquiryController.js";

const router = express.Router();

// Public Route
router.post("/create", createInquiry);

// Admin Routes (You should add admin middleware here later)
router.get("/", getAllInquiries);
router.get("/:id", getInquiryById);
router.patch("/:id/status", updateInquiryStatus);
router.delete("/:id", deleteInquiry);

export default router;