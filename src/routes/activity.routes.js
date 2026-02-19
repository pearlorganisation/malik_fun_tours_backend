import express from "express";
import {
  // getAllActivities,
  // getActivityById,
  // updateActivity,
  // deleteActivity,
  // toggleActive,
  // getPopularActivities,
  // getPopularLocations,
  // getActivitiesByCategory,
  createActivity,
  updateActivity,
  getActivityById,
  toggleActivityStatusById,
  getAllActivity,
  createPackage,
  updatePackage,
} from "../controllers/activity.controller.js";
import { upload } from "../middlewares/multer.js";
import {
  activityValidator,
  updateActivityValidator,
  createPackageValidator,
  updatePackageValidator,
} from "../middlewares/validators/activityValidator.js";
import { validateRequest } from "../middlewares/validateRequest.js";
const router = express.Router();

// router.get("/", getAllActivities); // GET /api/admin/activities
// router.get("/popular",getPopularActivities);
// router.get("/popular-locations",getPopularLocations);
// router.get("/category/:category", getActivitiesByCategory); // GET /api/admin/activities/:id
// router.get("/:id", getActivityById); // GET /api/admin/activities/:id
router.post(
  "/create",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  activityValidator,
  validateRequest,
  createActivity
);

router.put(
  "/update/:id",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "video", maxCount: 1 },
  ]),
  updateActivityValidator,
  validateRequest,
  updateActivity
);

router.patch("/toggle/:id", toggleActivityStatusById);
router.get("get-activity/:id", getActivityById);
router.get("/search", getAllActivity);

router.post(
  "/create-package",
  createPackageValidator,
  validateRequest,
  createPackage
);
router.put(
  "/update-package/:id",
  updatePackageValidator,
  validateRequest,
  updatePackage
);

// router.post("/", createPackageValidator, validateRequest, createPackage);

// POST /api/admin/activities
// router.put("/:id", updateActivity); // PUT /api/admin/activities/:id
// router.delete("/:id", deleteActivity); // DELETE /api/admin/activities/:id
// router.patch("/:id/toggle-active", toggleActive); // PATCH toggle status

export default router;
