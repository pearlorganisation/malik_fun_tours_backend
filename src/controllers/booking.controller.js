import Activity from "../models/Activity.js";
import Booking from "../models/Booking.js";
import stripe from "../configs/stripe.js";
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
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 🔒 Ownership check
    if (!req.user || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    // 🔁 Check if already paid
    if (booking.paymentStatus === "paid") {
      return res.status(200).json({ success: true, message: "Already confirmed", isPaid: true });
    }

    if (!booking.paymentIntentId) {
      return res.status(400).json({ success: false, message: "No payment intent found" });
    }

    // Retrieve the PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(booking.paymentIntentId);

    // 🔐 Verification
    // 1. Check if payment succeeded in Stripe
    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ 
        success: false, 
        message: `Payment status is: ${paymentIntent.status}`,
        isPaid: false 
      });
    }

    // 2. Amount verification (Ensure the amount paid matches the booking)
    if (paymentIntent.amount !== Math.round(booking.totalAmount * 100)) {
      return res.status(400).json({ success: false, message: "Amount mismatch" });
    }

    // Update database
    booking.paymentStatus = "paid";
    booking.status = "confirmed"; // Matches your schema
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking confirmed",
      isPaid: true,
    });
  } catch (error) {
    console.error("Error in confirmPayment:", error);
    res.status(500).json({ success: false, message: "Payment verification failed" });
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

export const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (page < 1 || limit < 1) {
      return res.status(400).json({
        success: false,
        message: "Page and limit must be positive integers.",
      });
    }

    const status = req.query.status;
    const search = req.query.search?.trim();

    /** ---------------- BASE MATCH ---------------- */
    const matchStage = {};
    if (status && status !== "all") {
      matchStage.status = status;
    }

    /** ---------------- PIPELINE ---------------- */
    const pipeline = [
      { $match: matchStage },

      // 🔗 activity join
      {
        $lookup: {
          from: "activities",
          localField: "activity",
          foreignField: "_id",
          as: "activity",
        },
      },
      { $unwind: "$activity" },

      // 🔗 user join
      {
        $lookup: {
          from: "users",
          let: { userId: "$user" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$_id", "$$userId"] },
              },
            },
            {
              $project: {
                password: 0,
                refresh_token: 0,
                __v: 0,
              },
            },
          ],
          as: "user",
        },
      },
      { $unwind: "$user" },
    ];

    /** ---------------- SEARCH ---------------- */
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "activity.title": { $regex: search, $options: "i" } },
            { "user.name": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    /** ---------------- SORT + PAGINATION ---------------- */
    pipeline.push(
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          totalCount: [{ $count: "count" }],
        },
      }
    );

    const result = await Booking.aggregate(pipeline);

    const bookings = result[0].data;
    const totalBookings = result[0].totalCount[0]?.count || 0;
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
    console.error("Error fetching all bookings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all bookings",
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate("activity", "title images duration location")
      .populate("user", "name email");
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }
    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch booking",
    });
  }
};
