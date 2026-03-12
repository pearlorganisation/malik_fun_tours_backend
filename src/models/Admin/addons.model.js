import mongoose from "mongoose";

const addonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true,
    },
    price: { type: Number, required: true, min: 0 },
    max: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("Addon", addonSchema);
