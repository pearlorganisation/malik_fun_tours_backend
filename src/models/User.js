import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { USER_ROLES_ENUM } from "../../constants.js";

const user_schema= new mongoose.Schema({
    name:{type:String, required:true},
    email:{type:String, required:true},
    phoneNumber:{type:String},
    isVerified:{
        type:Boolean,
        default:false
    },
    password:{type:String, required:true},
    role: {
      type: String,
      enum: USER_ROLES_ENUM,
      default: "USER", 
    },
    refresh_token:{type:String}
},{
    timestamps:true
})


user_schema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});


user_schema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      role: this.role,
     // role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

user_schema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

user_schema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User",user_schema)

export default User;