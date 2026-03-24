import express from "express"
import { createOrder } from "../controllers/order.controller.js"
import { authenticateToken } from "../middlewares/authMiddleware.js";



const orderRoute = express.Router()


orderRoute.post("/create" , authenticateToken , createOrder)


export default orderRoute;