import express from "express"
import { create_partner } from "../controllers/travel_partner.controller.js"
import { upload } from "../middlewares/multer.js"
const router = express.Router()

router.route(`/`).post(upload.single("logo_image"),create_partner)