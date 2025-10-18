import express from "express"
import { webhook_handler } from "../controllers/order.controller.js"
const router = express.Router()

router.post(`/`, webhook_handler)
export default router