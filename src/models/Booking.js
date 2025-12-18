import mongoose from "mongoose";

const ParticipantSchema = new mongoose.Schema({
  label: String, // Adult / Child
  quantity: Number,
  price: Number,
});

const SelectedAddonSchema = new mongoose.Schema({
  title: String,
  price: Number,
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

    variantName: String, // "Premium"
    date: Date,
    timeSlot: String,

    participants: [ParticipantSchema],
    addons: [SelectedAddonSchema],

    currency: { type: String, default: "AED" },
    subtotal: Number,
    tax: { type: Number, default: 0 },
    totalAmount: Number,

    checkoutSessionId: String,

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", BookingSchema);
