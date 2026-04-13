import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, default: "" },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Place",
      required: true,
    },

    pricePerNight: { type: Number, required: true },

    rating: {
      average: { type: Number, default: 0 },   
      count: { type: Number, default: 0 },  
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Hotel", hotelSchema);