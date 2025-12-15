import express from "express";
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActive,
} from "../controllers/activity.controller.js";

const router = express.Router();

router.get("/", getAllActivities); // GET /api/admin/activities
router.get("/:id", getActivityById); // GET /api/admin/activities/:id
router.post("/", createActivity); // POST /api/admin/activities
router.put("/:id", updateActivity); // PUT /api/admin/activities/:id
router.delete("/:id", deleteActivity); // DELETE /api/admin/activities/:id
router.patch("/:id/toggle-active", toggleActive); // PATCH toggle status

export default router;
