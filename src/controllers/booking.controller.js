import Activity from "../models/Admin/activity.model.js";
import Booking from "../models/Booking.js";
// import stripe from "../configs/stripe.js";
import { calculateActivityPrice } from "../utils/calculateActivityPrice.js";

// export const createBooking = async (req, res) => {
//   try {
//     const {
//       activityId,
//       variantName,
//       date,
//       timeSlot,
//       participants,
//       addons = [],
//     } = req.body;

//     const activity = await Activity.findById(activityId);
//     if (!activity)
//       return res.status(404).json({ message: "Activity not found" });

//     const variant = activity.variants.find(
//       (v) => v.name === variantName && v.isActive
//     );
//     if (!variant) return res.status(400).json({ message: "Invalid variant" });

//     // Calculate price
//     const { subtotal, total } = calculateActivityPrice({
//       variant,
//       participants,
//       addons,
//     });

//     // Create booking first (status: pending)
//     const booking = await Booking.create({
//       user: req.user?._id,
//       activity: activityId,
//       variantName,
//       date,
//       timeSlot,
//       participants,
//       addons,
//       subtotal,
//       totalAmount: total,
//       status: "pending",
//     });

//     // ✅ Create Stripe Checkout Session (HPP)
//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "aed",
//             product_data: {
//               name: activity.title,
//               description: `${variantName} | ${date} ${timeSlot}`,
//             },
//             unit_amount: Math.round(total * 100), // AED → fils
//           },
//           quantity: 1,
//         },
//       ],
//       success_url: `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking._id}`,
//       cancel_url: `${process.env.FRONTEND_URL}/booking/status?bookingId=${booking._id}`,
//       metadata: {
//         bookingId: booking._id.toString(),
//         activityId,
//         variantName,
//       },
//       customer_email: req.user?.email,
//     });

//     // Save session ID
//     booking.checkoutSessionId = session.id;
//     await booking.save();

//     res.status(201).json({
//       success: true,
//       bookingId: booking._id,
//       checkoutUrl: session.url, // 🔥 HPP URL
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };


export const createBooking = async (req, res) => {
  try {
    const {
      activityId,
      activityName,      // From Payload
      packageId,
      variantName,       // From Payload
      whatInclude,       // From Payload
      whatExclude,       // From Payload
      selectedDate,
      timeSlot,
      participantsBreakdown,
      addons,
      transferType,
      suvCount,
      suvModel,          // From Payload
      pricing,
      customerDetails,
      paymentMethod,
      bookingReference
    } = req.body;

    const activity = await Activity.findById(activityId);
    if (!activity) return res.status(404).json({ message: "Activity not found" });

    // mapping logic
    const bookingData = {
      user: req.user?._id,
      activity: activityId,
      packageId: packageId,
      activityName: activityName || activity.name, // Snapshot
      variantName: variantName,                    // Snapshot
      whatInclude: whatInclude || [],              // Snapshot
      whatExclude: whatExclude || [],              // Snapshot
      date: selectedDate,
      timeSlot: timeSlot,
      bookingReference: bookingReference,
      
      guestDetails: {
        firstName: customerDetails.firstName,
        lastName: customerDetails.lastName,
        email: customerDetails.email,
        whatsappPhone: customerDetails.phone,
        // pickupHotel: customerDetails.pickupHotel,
             pickupHotel: customerDetails.pickupHotel || "Not provided",
      },

      extras: {
        isSuvSelected: transferType === "Private SUV",
        suvCount: suvCount || 0,
        suvModel: suvModel || "SUV", // Model snapshot
         notes: req.body.notes || ""
      },

      bookingFields: participantsBreakdown.map(p => ({
        fieldId: p.fieldId,
        value: p.quantity
      })),

      addons: addons.map(a => ({
        addonId: a.addonId,
        title: a.name,
        price: a.price,
        quantity: a.quantity
      })),

      amountBreakdown: [
        { label: "Base Fare", amount: pricing.baseFare, quantity: 1 },
        { label: "Addons Total", amount: pricing.addonsTotal, quantity: 1 },
        { label: "SUV Total", amount: pricing.suvTotal, quantity: suvCount || 0 }
      ],

      totalAmount: pricing.grandTotal,
      currency: "AED",
     // Status & Payment Method Logic
      paymentMethod: paymentMethod, // 'pay_now' or 'pay_later'
      status: "pending", // Initial status hamesha pending rahega
      paymentStatus: paymentMethod === "pay_later" ? "awaiting_payment" : "pending"
    };

    // 3. Save to Database
    const booking = await Booking.create(bookingData);

    // 4. Return Response (Stripe skip kar diya hai)
    res.status(201).json({
      success: true,
      message: paymentMethod === "pay_later" 
        ? "Booking created! Please pay at the counter." 
        : "Booking initiated successfully.",
      bookingId: booking._id,
      bookingReference: booking.bookingReference
    });
    

  } catch (error) {
    console.error("Booking Creation Error:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


export const getAllBookings = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      search, 
      paymentStatus 
    } = req.query;

    const skip = (page - 1) * limit;
    let query = {};
    if (status && status !== "all") query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: "i" } },
        { "guestDetails.email": { $regex: search, $options: "i" } },
        { "guestDetails.firstName": { $regex: search, $options: "i" } },
        { activityName: { $regex: search, $options: "i" } }
      ];
    }
    const bookings = await Booking.find(query)
      .populate({
        path: "activity",
        select: "name Images categoryId placeId" 
      })
      .populate({
        path: "packageId",
        select: "name price bookingFields"
      })
      .populate({
        path: "addons.addonId",
        select: "name price"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET SINGLE BOOKING BY ID (Deep Detail View)
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("user", "name email") // User details
      .populate("activity")           // Full Activity details
      .populate("packageId")          // Full Package details
      .populate("addons.addonId");    // Original Addon prices/names

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. UPDATE BOOKING STATUS (Status / Payment Status)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Update fields if provided
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (notes) booking.extras.notes = notes;

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 4. DELETE BOOKING
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking already deleted or not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted from system successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



