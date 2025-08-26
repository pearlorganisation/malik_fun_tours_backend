import mongoose from "mongoose";

const user_schema= new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    phoneNumber:{type:String},
    isVerified:{
        type:Boolean,
        default:false
    },
    password:{type:String, required:true},
    refresh_token:{type:String}
},{
    timestamps:true
})

export const User = mongoose.model("User",user_schema)