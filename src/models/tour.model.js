import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  label: String,
  quantity: Number,
  unit: String,
  pricePerUnit: Number,
});

const tourSchema = new mongoose.Schema(
  {
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    activityName: String,
    variantName: String,
    selectedDate: String,
    timeSlot: String,
    isYachtActivity: { type: Boolean, default: false },
    participantsBreakdown: [participantSchema],
    totalGuests: Number,
    transferType: String,
    addons: { type: Array, default: [] },
    pricing: {
      baseFare: Number,
      addonsTotal: Number,
      suvTotal: Number,
      grandTotal: Number,
    },
    customerDetails: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      pickupHotel: String,
    },
    bookingReference: { type: String, unique: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);
export default Tour;