import mongoose from "mongoose";

// const BookingFieldSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true, // e.g. "Adults", "Children", "Duration"
//     },

//     unit: {
//       type:String,
//       required:true,
//       enum:["minute","quantity"]
//     },
//     seat :{
//       type : Number,
//       required: function () {
//       return this.unit === "minute";
//     },
//     },

//     duration :{
//       type : Number,
//        required: function () {
//         return this.unit === "minute"; 
//       },
//     },
    

//     min: Number, // minimum allowed value
//     max: Number, // maximum allowed value

//     price: {
//       type: Number,
//       required: true, // price per unit/adult/hour
//     },

//   },
//   // { _id: false }
// );

const BookingFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unit: { type: String, enum: ["minute", "quantity"] },
  groupType: { type: String, enum: ["independent", "vessel", "duration"], default: "independent" },
  price: Number,        // Price of 1 EXTRA unit
  min: Number,          // Min allowed
  max: Number,          // Max allowed
  includedQuantity: {   // ADD THIS: e.g., 2 adults included in base price
    type: Number, 
    default: 0 
  },
  duration: Number 
});
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