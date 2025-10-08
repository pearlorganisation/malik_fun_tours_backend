import mongoose from "mongoose"

const destination_schema= new mongoose.Schema({
    name:{type:String, required:true, index:true, unique:true},
    destination_description:{type:String},
    location: {
         type: {
             type: String,
             enum: ["Point"],
             required: true,
             default: "Point",
         },
         coordinates: {
             type: [Number], // [longitude, latitude]
             required: true,
         },
     },

},
{
    timestamps:true
})

const Destination = mongoose.model("Destination",destination_schema)
export default Destination