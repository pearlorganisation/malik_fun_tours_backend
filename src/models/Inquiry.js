import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema({
  tourId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity_Malik", default: null },
  tourName: { type: String },
  adults: { type: Number, default: 1 },
  kids: { type: Number, default: 0 },
  requirement: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Inquiry", inquirySchema);