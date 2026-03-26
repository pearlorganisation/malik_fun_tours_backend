// // import mongoose from "mongoose";

// // const ParticipantSchema = new mongoose.Schema({
// //   label: String, // Adult / Child
// //   quantity: Number,
// //   price: Number,
// // });

// // const SelectedAddonSchema =  new mongoose.Schema({
// //   title: String,
// //   price: Number,
// // });

// // const BookingSchema = new mongoose.Schema(
// //   {
// //     user: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //     },

// //     activity: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Activity",
// //       required: true,
// //     },

// //     variantName: String, // "Premium"
// //     date: Date,
// //     timeSlot: String,

// //     participants: [ParticipantSchema],
// //     addons: [SelectedAddonSchema],

// //     currency: { type: String, default: "AED" },
// //     subtotal: Number,
// //     tax: { type: Number, default: 0 },
// //     totalAmount: Number,

// //     checkoutSessionId: String,

// //     status: {
// //       type: String,
// //       enum: ["pending", "paid", "cancelled"],
// //       default: "pending",
// //     },
// //   },
// //   { timestamps: true }
// // );

// // export default mongoose.model("Booking", BookingSchema);


// import mongoose from "mongoose";

// const BookingFieldSchema = new mongoose.Schema({
//   fieldId: {
//     type: mongoose.Schema.Types.ObjectId,
//   },
//   value: Number,
// });

// const SelectedAddonSchema = new mongoose.Schema({
//   addonId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Addon",
//   },
//   title: String,
//   price: Number,
//   quantity: {
//     type: Number,
//     default: 1,
//   },
// });

// const AmountBreakdownSchema = new mongoose.Schema({
//   label: String,   // e.g. "Base Price", "Addon", "SUV Cost"
//   amount: Number,  // amount for that item
// });

// const BookingSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     activity: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Activity",
//       required: true,
//     },

//     packageId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Package",
//       required: true,
//     },

//     // 🔥 Dynamic booking fields
//     bookingFields: [BookingFieldSchema],

//     // 🔥 Addons with quantity
//     addons: [SelectedAddonSchema],

//     // 🔥 SUV / extra options
//     isSuvSelected: {
//       type: Boolean,
//       default: false,
//     },

//     // 💰 Pricing
//     currency: { type: String, default: "AED" },
//     subtotal: Number,
//     tax: { type: Number, default: 0 },
//     totalAmount: {
//       type: Number,
//       required: true,
//     },

//     amountBreakdown: [AmountBreakdownSchema],

//     // 💳 Stripe
//     checkoutSessionId: String,
//     paymentIntentId: String,

//     paymentStatus: {
//       type: String,
//       enum: ["pending", "paid", "failed"],
//       default: "pending",
//     },
//      date: {
//       type: Date,
//       required: true,
//     },
//     timeSlot: {
//       type: String, // e.g., "10:00 AM"
//       required: true,
//     },

//     status: {
//       type: String,
//       enum: ["pending", "confirmed", "cancelled"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Booking", BookingSchema);


import mongoose from "mongoose";

const BookingFieldSchema = new mongoose.Schema({
  fieldId: { type: mongoose.Schema.Types.ObjectId },
  value: Number,
});

const SelectedAddonSchema = new mongoose.Schema({
  addonId: { type: mongoose.Schema.Types.ObjectId, ref: "Addon" },
  title: String,
  price: Number,
  quantity: { type: Number, default: 1 },
});

const AmountBreakdownSchema = new mongoose.Schema({
  label: String,
  amount: Number,
  quantity: Number, // Storing quantity here fixes your label issue
});

const BookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Grouped Guest Details
    guestDetails: {
      firstName: String,
      lastName: String,
      email: String,
      whatsappPhone: String,
      pickupHotel: String,
    },

    // Grouped Extras/SUV
    extras: {
      isSuvSelected: { type: Boolean, default: false },
      suvCount: { type: Number, default: 0 },
      notes: String,
    },

    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
    
    bookingFields: [BookingFieldSchema],
    addons: [SelectedAddonSchema],
    
    // Pricing
    currency: { type: String, default: "AED" },
    totalAmount: { type: Number, required: true },
    amountBreakdown: [AmountBreakdownSchema],

    // Payment & Status
    paymentMethod: { type: String, enum: ["pay_now", "pay_later"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "awaiting_payment"],
      default: "pending",
    },
    paymentIntentId: String,
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
  },

  
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);