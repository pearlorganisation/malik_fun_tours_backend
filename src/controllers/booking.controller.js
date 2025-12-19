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

    // Create booking first (status: pending)
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
      status: "pending",
    });

    // ✅ Create Stripe Checkout Session (HPP)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "aed",
            product_data: {
              name: activity.title,
              description: `${variantName} | ${date} ${timeSlot}`,
            },
            unit_amount: Math.round(total * 100), // AED → fils
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking._id}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking._id}`,
      metadata: {
        bookingId: booking._id.toString(),
        activityId,
        variantName,
      },
      customer_email: req.user?.email,
    });

    // Save session ID
    booking.checkoutSessionId = session.id;
    await booking.save();

    res.status(201).json({
      success: true,
      bookingId: booking._id,
      checkoutUrl: session.url, // 🔥 HPP URL
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const confirmPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
        isPaid: false,
      });
    }

    // 🔒 Ownership check
    console.log(booking)
    console.log("Booking User ID:", booking.user.toString());
    console.log("Request Use",req.user);
    if (!req.user || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access",
        isPaid: false,
      });
    }

    // 🔁 Idempotent
    if (booking.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Already confirmed",
        isPaid: true,
      });
    }

    if (!booking.checkoutSessionId) {
      return res.status(400).json({
        success: false,
        message: "No checkout session found",
        isPaid: false,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(
      booking.checkoutSessionId,
      { expand: ["payment_intent"] }
    );

    // 🔐 Metadata validation
    if (session.metadata?.bookingId !== booking._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Session mismatch",
        isPaid: false,
      });
    }

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
        isPaid: false,
      });
    }

    if (session.amount_total !== Math.round(booking.totalAmount * 100)) {
      return res.status(400).json({
        success: false,
        message: "Amount mismatch",
        isPaid: false,
      });
    }

    booking.status = "paid";
    booking.paymentIntentId = session.payment_intent.id;
    booking.paidAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed",
      isPaid: true,
    });
  } catch (error) {
    console.log("Error in confirmPayment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      isPaid: false,
    });
  }
};

// Add this to your booking controller file

export const getMyBookings = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in.",
      });
    }

    // Build filter object
    const filter = { user: req.user._id };

    // Filter by status (pending, paid, cancelled)
    if (req.query.status) {
      const status = req.query.status.toLowerCase();
      if (!["pending", "paid", "cancelled"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status. Must be 'pending', 'paid', or 'cancelled'.",
        });
      }
      filter.status = status;
    }

    // Filter by paid (shortcut for status=paid)
    if (req.query.paid !== undefined) {
      const paid = req.query.paid === "true" || req.query.paid === "1";
      if (paid) {
        filter.status = "paid";
      }
      // if paid=false → show all (no extra filter)
    }

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers.",
      });
    }

    // Fetch bookings with filters + pagination
    const bookings = await Booking.find(filter)
      .populate("activity", "title images duration location")
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .exec();

    // Get total count for pagination metadata
    const totalBookings = await Booking.countDocuments(filter);

    const totalPages = Math.ceil(totalBookings / limit);

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookings,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      bookings,
    });
  } catch (error) {
    console.error("Error fetching my bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your bookings",
    });
  }
};

