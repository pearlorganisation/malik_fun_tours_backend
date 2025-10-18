import mongoose, { Schema } from "mongoose";

const voucher_schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  activity: { type: Schema.Types.ObjectId, ref: "Activity" },
  order: { type: Schema.Types.ObjectId, ref: "Order" },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  issued_at: { type: Date, default: Date.now },
  valid_till: { type: Date },
  status: {
    type: String,
    enum: ["Active", "Used", "Expired", "Cancelled"],
    default: "Active"
  }
}, { timestamps: true });

const Voucher = mongoose.model("Voucher", voucher_schema);
export default Voucher;
