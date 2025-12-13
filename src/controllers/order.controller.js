import Stripe from "stripe";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import Order from "../models/Order.js";
import voucher_codes from "voucher-code-generator"
import Voucher from "../models/Voucher.js";

const secret_key = process.env.STRIPE_SECRET_KEY
const webhook_endpoint_secret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;
console.log("the secret key",secret_key)
console.log("the secret key", webhook_endpoint_secret)

const stripe = new Stripe(secret_key)

const generate_voucher = () => {
  const result = voucher_codes.generate({
    prefix: "activity_voucher_code-",
    postfix: "-2025",
  })
  return result[0]
};

export const create_order =asyncHandler(async(req, res) => {
  const type = Number(req.query.type); // ensure numeric

  const {
    user,
    order_amount,
    package_id,
    selected_package_option,
    tour_itinerary_details,
    extra_add_ons,
  } = req.body;

  // 1️⃣ Create Stripe Payment Intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: order_amount,
    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  let finalExtraAddOns = [];

  // 2️⃣ CREATE ACTIVITY VOUCHERS + MAPPING
  if (type === 2) {
    if (extra_add_ons && extra_add_ons.length > 0) {
      finalExtraAddOns = await Promise.all(
        extra_add_ons.map(async (item) => {
          // "item" is { activity: ObjectId, voucher: null }

          const voucherData = await Voucher.create({
            code: generate_voucher(),
            activity: item.activity,
            user: user,
          });

          return {
            activity: item.activity,
            voucher: voucherData._id,
          };
        })
      );
    }
  }

  // 3️⃣ FINAL PAYLOAD FOR DB
  const payload = {
    order_id: paymentIntent.id,
    user,
    order_amount,
    package_id,
    selected_package_option,
    tour_itinerary_details,
    extra_add_ons: finalExtraAddOns,
  };

  // 4️⃣ SAVE ORDER
  const createdOrder = await Order.create(payload);

  return res.status(201).json({
    success: true,
    message: "Order created successfully",
    clientSecret: paymentIntent.client_secret,
    order_id: paymentIntent.id,
  });
});

// =============================
// STRIPE WEBHOOK HANDLER
// =============================
export const webhook_handler = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhook_endpoint_secret
    );
  } catch (err) {
    console.log("Webhook verification error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      console.log("Payment success:", paymentIntent.id);

      await Order.findOneAndUpdate(
        { order_id: paymentIntent.id },
        { payment_status: "Completed" }
      );

      break;
    }

    default:
      console.log("Unhandled event:", event.type);
  }

  return res.status(200).send("Webhook received successfully");
});

// =============================
// MANUAL PAYMENT VERIFICATION
// =============================
export const verify_payment = asyncHandler(async (req, res) => {
  const payment_id = req.query.payment_id;

  const order = await Order.findOne({ order_id: payment_id });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  order.payment_status = "Completed";
  await order.save();

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
  });
});
