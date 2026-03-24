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
    },
    seat :{
      type : Number,
      required: function () {
      return this.unit === "quantity";
    },
    },

    duration :{
      type : Number,
       required: function () {
        return this.unit === "minute"; 
      },
    },
    

    min: Number, // minimum allowed value
    max: Number, // maximum allowed value

    price: {
      type: Number,
    },

  },
  // { _id: false }
);

// const BookingFieldSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   unit: { type: String, enum: ["minute", "quantity"] },
//   groupType: { 
//     type: String, 
//     enum: ["independent", "vessel", "duration"], 
//     default: "independent" 
//   },
//   isPassenger: { type: Boolean, default: false }, // Use this to identify who sits in the SUV
//   price: { type: Number, default: 0 },            // Price for extra units
//   min: { type: Number, default: 0 },              // Minimum requirement
//   max: { type: Number },                          // Maximum requirement
//   includedQuantity: { type: Number, default: 0 }, // How many are INCLUDED in base price
//   duration: Number                                // Only for "minute" units
// });
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

    addons:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Addon",
      }
    ],

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