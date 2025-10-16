import express from "express"
import mongoose from "mongoose"
const travel_partner_schema = new mongoose.Schema({
    name:{type:String, required:true},
    logo:{
        secure_url:{ type:String },
        public_id:{ type:String }
    },
    description:{type:String},
},{
    timestamps:true
})

const Travel_Partner = mongoose.model("Partner",travel_partner_schema)
export default Travel_Partner