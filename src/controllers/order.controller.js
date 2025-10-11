import Stripe from "stripe";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import Order from "../models/Order.js";

const secret_key = process.env.STRIPE_SECRET_KEY
console.log("the secret key",secret_key)

const stripe = new Stripe(secret_key)

export const create_order =asyncHandler(async(req, res , next)=>{
    const {
        user,
        order_amount,
        package_id,
        selected_package_option,
        tour_itinerary_details
    } = req.body
    const order = await stripe.paymentIntents.create({
        amount:order_amount,
        currency:"usd",
        automatic_payment_methods:{
            enabled:true
        }
    })
    let payload = {
        order_id:order.id,
        user:user,
        order_amount:order_amount,
        package_id:package_id,
        selected_package_option:selected_package_option,
        tour_itinerary_details:tour_itinerary_details
    }
    const order_data = await Order.create(payload)
    console.log("the created order is", order_data)
    console.log(order,"order")
    return res.status(201).json({
        message:"Order created successfully",
        clientSecret:order.client_secret,
        success:true
    })
})