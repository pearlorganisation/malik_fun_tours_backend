import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
{
  orderId: {
    type: String,
    unique: true,
    required: true
  },

  totalAmount: {
    type: Number,
    required: true
  },

  orderBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true
  },

  activity: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Activity_Malik"
},

  quantity: {
    type: Number,
    default: 1
  },

  time: {
    type: Number  
  },

  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending"
  }

},
{
  timestamps: true
}
);

const Order = mongoose.model("Order", orderSchema);

export default Order;