import express from "express"
import { createOrder } from "../controllers/order.controller.js"



const orderRoute = express.Router()


orderRoute.post("/create" , createOrder)


export default orderRoute;