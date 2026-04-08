import express from "express";
import { 
  createPage, 
  getAllPages, 
  getPageBySlug, 
  updatePage, 
  deletePage 
} from "../controllers/page.controller.js";

const router = express.Router();

router.post("/create", createPage);
router.get("/all", getAllPages);
router.get("/:slug", getPageBySlug); // Slug based fetch for frontend
router.put("/:id", updatePage);
router.delete("/:id", deletePage);

export default router;