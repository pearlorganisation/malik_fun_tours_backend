import express from "express"
import { createDestination, deleteDestination, findNearbyDestinations, getAllDestinations, getDestinationById, updateDestination } from "../controllers/destination.controller.js"
const router = express.Router()
router.route(`/`).post(createDestination).get(getAllDestinations)

router.route(`/:id`).get(getDestinationById).patch(updateDestination).delete(deleteDestination)

router.route(`/nearby`).get(findNearbyDestinations)

export default router