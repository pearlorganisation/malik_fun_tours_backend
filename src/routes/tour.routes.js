import express from "express";
const router = express.Router();
// Controller se saare functions import karein
import { 
  createTour, 
  getAllTours, 
  getTourById, 
  deleteTour 
} from "../controllers/tour.controller.js"; 

// Routes
router.post("/create", createTour);
router.get("/all", getAllTours);
router.get("/:id", getTourById);
router.delete("/:id", deleteTour);

export default router;