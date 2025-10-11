import express from "express"
import { create_vehicle, delete_vehicle, get_all_vehicles, get_single_vehicle, update_vehicle } from "../controllers/vehicle.controller.js"
const router = express.Router()

router.route(`/`).post(create_vehicle).get(get_all_vehicles)
router.route(`/:id`).get(get_single_vehicle).patch(update_vehicle).delete(delete_vehicle)

export default router