import Stripe from "stripe";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import Order from "../models/Order.js";
import voucher_codes from "voucher-code-generator"
import Voucher from "../models/Voucher.js";

const secret_key = process.env.STRIPE_SECRET_KEY
const webhook_endpoint_secret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET
console.log("the secret key",secret_key)
console.log("the secret key", webhook_endpoint_secret)

const stripe = new Stripe(secret_key)

const generate_voucher = ()=>{
    let result = voucher_codes.generate({
           prefix: "activity_voucher_code-",
           postfix: "-2025"
    })
    return result[0]
}

export const create_order =asyncHandler(async(req, res , next)=>{
    const type = req.query

    const {
        user,
        order_amount,
        package_id,
        selected_package_option,
        tour_itinerary_details,
        extra_add_ons
    } = req.body
    const order = await stripe.paymentIntents.create({
        amount:order_amount,
        currency:"usd",
        automatic_payment_methods:{
            enabled:true
        }
    })
    let payload
    console.log("extra_addons_before", extra_add_ons)
    let extra_addons_result =null
    // for package booking
    if(type==2){
    if(extra_add_ons && extra_add_ons?.length>0){
         extra_addons_result = await Promise.all(extra_add_ons?.map(async (activityId) => {
            let voucherdata = await Voucher.create({
                code: generate_voucher(),
                activity: activityId,
                user:user
            })
           return {
               activity: activityId,
               voucher: voucherdata._id
           };
         }))
    }
    console.log("extra_addons result is", extra_addons_result)
      payload = {
        order_id:order.id,
        user:user,
        order_amount:order_amount,
        package_id:package_id,
        selected_package_option:selected_package_option,
        tour_itinerary_details:tour_itinerary_details,
        extra_add_ons: extra_addons_result
    }
    }
    // if(type==1){
    //     pa
    // }
    const order_data = await Order.create(payload)
    console.log("the created order is", order_data)
    console.log(order,"order")
    return res.status(201).json({
        message:"Order created successfully",
        clientSecret:order.client_secret,
        success:true
    })
})


// export const webhook_handler = asyncHandler(async(req, res, next)=>{
//     let event = req.body;
//     console.log(req.body,"webhook payload")
//     const signature = req.headers['stripe-signature']
//     try {
//         event = stripe.webhooks.constructEvent(event, signature, webhook_endpoint_secret)
//     } catch (error) {
//            console.log(`⚠️  Webhook signature verification failed.`,  error);
//            return res.sendStatus(400);
//     }

//      switch (event.type) {
//          case 'payment_intent.succeeded':
//              const paymentIntent = event.data.object;
//              console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//              // Then define and call a method to handle the successful payment intent.
//              // handlePaymentIntentSucceeded(paymentIntent);
//              break;
//          case 'payment_method.attached':
//              const paymentMethod = event.data.object;
//              // Then define and call a method to handle the successful attachment of a PaymentMethod.
//              // handlePaymentMethodAttached(paymentMethod);
//              break;
//          default:
//              // Unexpected event type
//              console.log(`Unhandled event type ${event.type}.`);
//      }
//        console.log("successfully confirming the payment", event.data) 
//      // Return a 200 response to acknowledge receipt of the event
//      res.send();
// })

export const webhook_handler = asyncHandler(async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    // console.log("requested data",req)
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhook_endpoint_secret);
    } catch (err) {
        console.log("the error",err)
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            // console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
            break;
        }
        case "payment_method.attached": {
            const paymentMethod = event.data.object;
            // console.log(`Payment method attached: ${paymentMethod.id}`);
            break;
        }
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }
    console.log("the event is", event)
    return res.status(200).send("Webhook received successfully");
});



export const verify_payment= asyncHandler(async(req , res , next)=>{
    const payment_id = req.query.payment_id
    const existing_order = await Order.findOneAndUpdate({
        order_id:payment_id
    })
    // if(!existing_order){
       
    // }
    existing_order.payment_status = "Completed"
    existing_order.save()
    console.log("the saved order and verified",existing_order)
    return res.status(201).json({message:"Payment is Verified",success:true})
})