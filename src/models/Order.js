import mongoose, { Schema } from "mongoose";

const order_schema = new mongoose.Schema({
    order_id:{type:String},
    user:{ type:Schema.Types.ObjectId, ref:"User"},
    order_amount:{ type: Number},
    order_type:{
      type:Number,
      enum:[1,2] // 1 for activities booking only 2 for package bookings
    },
    activities_id:[{
      type:Schema.Types.ObjectId,
      ref: 'Activity'
    }],
    package_id:{type:Schema.Types.ObjectId, ref:"Package"},
    selected_package_option:{ type:String },
    tour_itinerary_details:{
    tour_time:{type: String},
      people_meta:{
        total:{type:Number},
        adults:{type:Number},
        children:{type:Number},
        infants:{type:Number}
      },
      details:{}
    },
    payment_status:{
        type:String,
        enum:["Pending","Completed","Cancelled","Refunded"],
        default:"Pending"
    },
    tour_status:{
      type:String,
      enum: ["Upcoming", "Completed", "Cancelled", "Refunded"],
      default:"Upcoming"
    },
    extra_add_ons:[
      {
        activity:{
          type:Schema.Types.ObjectId,
          ref:"Activity"},
        voucher:{
          type:Schema.Types.ObjectId,
          ref:"Voucher"
        }
      }
    ],

},{
    timestamps:true
})

const Order = mongoose.model("Order",order_schema)
export default Order
