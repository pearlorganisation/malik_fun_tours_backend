import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    image: {
      url: { type: String },
      public_id: { type: String },
      resource_type: { type: String, default: "image" },
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
