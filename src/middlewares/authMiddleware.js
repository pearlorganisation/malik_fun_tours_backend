 
import ApiError from "../utils/error/ApiError.js";
import { asyncHandler } from "../utils/error/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authenticateToken = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.access_token ||
    req.header("Authorization")?.replace("Bearer ", "");

    console.log("the whole req is", token)
  if (!token) {
    return next(new ApiError("Unauthorized user", 401));
  }
  let decoded
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);   
  } catch (error) {
    return next(new ApiError("Invalid or expired token", 401));
  }

  let user = null
 /** here will write with the searching the user in the db */

  req.user = user;
  next();
});
 
export const verifyPermission = (...roles) =>
   {
     return (req, res, next) => {
       if (!roles.includes(req.user.role)) {
         return res.status(403).json({
           message: "Forbidden"
         });
       }
       next();
     };

   };
