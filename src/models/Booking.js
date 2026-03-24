// import mongoose from "mongoose";

// const ParticipantSchema = new mongoose.Schema({
//   label: String, // Adult / Child
//   quantity: Number,
//   price: Number,
// });

// const SelectedAddonSchema =  new mongoose.Schema({
//   title: String,
//   price: Number,
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

//     variantName: String, // "Premium"
//     date: Date,
//     timeSlot: String,

//     participants: [ParticipantSchema],
//     addons: [SelectedAddonSchema],

//     currency: { type: String, default: "AED" },
//     subtotal: Number,
//     tax: { type: Number, default: 0 },
//     totalAmount: Number,

//     checkoutSessionId: String,

//     status: {
//       type: String,
//       enum: ["pending", "paid", "cancelled"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Booking", BookingSchema);


import mongoose from "mongoose";

const BookingFieldSchema = new mongoose.Schema({
  fieldId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  value: Number,
});

const SelectedAddonSchema = new mongoose.Schema({
  addonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Addon",
  },
  title: String,
  price: Number,
  quantity: {
    type: Number,
    default: 1,
  },
});

const AmountBreakdownSchema = new mongoose.Schema({
  label: String,   // e.g. "Base Price", "Addon", "SUV Cost"
  amount: Number,  // amount for that item
});

const BookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    activity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },

    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },

    // 🔥 Dynamic booking fields
    bookingFields: [BookingFieldSchema],

    // 🔥 Addons with quantity
    addons: [SelectedAddonSchema],

    // 🔥 SUV / extra options
    isSuvSelected: {
      type: Boolean,
      default: false,
    },

    // 💰 Pricing
    currency: { type: String, default: "AED" },
    subtotal: Number,
    tax: { type: Number, default: 0 },
    totalAmount: {
      type: Number,
      required: true,
    },

    amountBreakdown: [AmountBreakdownSchema],

    // 💳 Stripe
    checkoutSessionId: String,
    paymentIntentId: String,

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);