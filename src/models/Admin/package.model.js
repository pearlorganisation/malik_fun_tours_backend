import mongoose from "mongoose";

const BookingFieldSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // e.g. "Adults", "Children", "Duration"
    },

    unit: {
      type:String,
      required:true,
      enum:["minute","quantity"]
    } ,

    min: Number, // minimum allowed value
    max: Number, // maximum allowed value

    price: {
      type: Number,
      required: true, // price per unit/adult/hour
    },

  },
  { _id: false }
);
const PackageSchema = new mongoose.Schema(
  {
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    name: { type: String, required: true },
    description: String,
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
    bookingFields: [BookingFieldSchema],
  },

  {
    timestamps: true,
  }
);

const  Package = mongoose.model("Package",PackageSchema);
export default Package;