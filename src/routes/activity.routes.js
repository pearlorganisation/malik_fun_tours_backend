import express from "express";
import {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  toggleActive,
  getPopularActivities,
  getPopularLocations,
  getActivitiesByCategory,
} from "../controllers/activity.controller.js";
import { upload } from "../middlewares/multer.js";
const router = express.Router();

router.get("/", getAllActivities); // GET /api/admin/activities
router.get("/popular",getPopularActivities);
router.get("/popular-locations",getPopularLocations);
router.get("/category/:category", getActivitiesByCategory); // GET /api/admin/activities/:id
router.get("/:id", getActivityById); // GET /api/admin/activities/:id
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  createActivity
); // POST /api/admin/activities
router.put("/:id", updateActivity); // PUT /api/admin/activities/:id
router.delete("/:id", deleteActivity); // DELETE /api/admin/activities/:id
router.patch("/:id/toggle-active", toggleActive); // PATCH toggle status

export default router;
