import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema(
  {
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    name: { type: String, required: true },
    price: {
      type: Number,
      required: true,
    },

    whatInclude: [String],
    whatExclude: [String],
    /* ---------- STATUS ---------- */
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);

const  Package = mongoose.model("Package",PackageSchema);
export default Package;