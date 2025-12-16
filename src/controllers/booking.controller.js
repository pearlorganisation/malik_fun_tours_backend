import Activity from "../models/Activity.js";
import Booking from "../models/Booking.js";
import stripe from "../configs/stripe.js"
import { calculateActivityPrice } from "../utils/calculateActivityPrice.js";

export const createBooking = async (req, res) => {
  try {
    const {
      activityId,
      variantName,
      date,
      timeSlot,
      participants,
      addons = [],
    } = req.body;

    const activity = await Activity.findById(activityId);
    if (!activity)
      return res.status(404).json({ message: "Activity not found" });

    const variant = activity.variants.find(
      (v) => v.name === variantName && v.isActive
    );
    if (!variant) return res.status(400).json({ message: "Invalid variant" });

    // Calculate price
    const { subtotal, total } = calculateActivityPrice({
      variant,
      participants,
      addons,
    });

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100), // AED → fils
      currency: "aed",
      automatic_payment_methods: { enabled: true },
      metadata: {
        activityId,
        variantName,
      },
    });

    // Save booking
    const booking = await Booking.create({
      user: req.user?._id,
      activity: activityId,
      variantName,
      date,
      timeSlot,
      participants,
      addons,
      subtotal,
      totalAmount: total,
      paymentIntentId: paymentIntent.id,
    });

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const confirmPayment = async (req, res) => {
  try {
    const { bookingId, paymentIntentId } = req.body;

    // 1. Fetch booking
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "paid") {
      return res.status(200).json({ message: "Already confirmed" });
    }

    // 2. Fetch PaymentIntent from Stripe (SERVER SIDE VERIFICATION)
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // 3. Validate PaymentIntent
    if (
      paymentIntent.status !== "succeeded" ||
      booking.paymentIntentId !== paymentIntent.id
    ) {
      return res.status(400).json({
        message: "Payment not verified",
      });
    }

    // 4. Amount safety check
    if (paymentIntent.amount !== Math.round(booking.totalAmount * 100)) {
      return res.status(400).json({
        message: "Amount mismatch",
      });
    }

    // 5. Update booking
    booking.status = "paid";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};