import express from "express";
import { createTag, getTags } from "../controllers/tag.controller.js";

const router = express.Router();

// Create Tag
router.post("/", createTag);

// Get All Tags
router.get("/", getTags);

export default router;
