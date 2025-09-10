import express from "express";
import { upload } from "../middlewares/multer.js";
import {
  create_activity,
  get_all_activities,
  delete_activity,
  update_activity,
} from "../controllers/activity.controller.js";

const router = express.Router();


router.route(`/`)
  .post(
    upload.fields([{ name: "activity_images", maxCount: 10 }]),
    create_activity
  )
  .get(get_all_activities);

router.route(`/:id`).delete(delete_activity);

router.patch(
  `/update/:id`,
  upload.fields([{ name: "activity_images", maxCount: 10 }]),
  update_activity
);

export default router;
