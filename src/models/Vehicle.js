import mongoose, { Schema } from "mongoose";

const vehicle_schema = new mongoose.Schema({
    name:{type:String, required:true},
    seat_capacity:{type:Number},
    price:{
        common_price:{type:Number},
        evening_price:{type:Number},
        morning_price:{type:Number}
    },
    destination:{
        type:Schema.Types.ObjectId, 
        ref:"Destination"
    },
    amenities:[String],
},{
    timestamps:true
})

const Vehicle = mongoose.model("Vehicle", vehicle_schema)
export default Vehicle