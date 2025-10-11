import express from "express"
import { create_order } from "../controllers/order.controller.js"
const router = express.Router()

router.route(`/create`).post(create_order)
export default router