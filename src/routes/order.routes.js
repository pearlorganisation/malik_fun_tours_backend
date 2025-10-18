import express from "express"
import { create_order, verify_payment } from "../controllers/order.controller.js"
const router = express.Router()

router.route(`/create`).post(create_order)
router.route(`/verify`).post(verify_payment)
export default router