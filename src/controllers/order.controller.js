import mongoose from "mongoose";
import Package from "../models/Admin/package.model.js";
import Activity_Malik from "../models/Admin/activity.model.js"



// const validateBookingDatafn = async(  BookingFiledIds , packageId , activityId, isSuvSelected  , totalPassanger ,totalAmount)=>{
//     let totalCalculatedAmount  = 0 
//     let detailCalculatedAmount = [];
//     let suv = 0;

//     const packageInfo = await Package.findOne({ _id: packageId, activityId: activityId, isActive: true })
//         .select("price name bookingFields");
//     if (!packageInfo) {
//         throw new Error("Package not found or not active");
//     }
//     console.log(packageInfo);

//       for (const userInput of BookingFiledIds) {

//          const fieldDefinition = packageInfo.bookingFields.find(
//             (field) => field._id.toString() === userInput.id.toString()
//         );

//         if (!fieldDefinition) {
//             throw new Error(`Invalid booking field ID: ${userInput.id}`);
//         }

//         if(fieldDefinition.min && userInput.value < fieldDefinition.min){
//         throw new Error(`${fieldDefinition.name} must be at least ${fieldDefinition.min}`);
        

//         }
//         if (fieldDefinition.max && userInput.value > fieldDefinition.max) {
//             throw new Error(`${fieldDefinition.name} cannot exceed ${fieldDefinition.max}`);
//         }
//           if (fieldDefinition.duration && (userInput.value < fieldDefinition.duration || valueToCalculateOn % fieldDefinition.duration != 0)) {
//             throw new Error(`${fieldDefinition.name} must be at least ${fieldDefinition.duration} or in proper fraction`);
//         }

         
//             const valueToCalculateOn = userInput.value
//              if(valueToCalculateOn){

//                 if(fieldDefinition.duration){
                    
//                      totalCalculatedAmount += (fieldDefinition.price * (valueToCalculateOn / fieldDefinition.duration  - 1 ));
//                      detailCalculatedAmount.push({ name : fieldDefinition.name  , quantity : valueToCalculateOn / fieldDefinition.duration , duration : fieldDefinition.min , pricePerMinDuration : fieldDefinition.price })
//                     //  suv = fieldDefinition.seat
//                 }else{
//                     totalCalculatedAmount += (fieldDefinition.price * (valueToCalculateOn / fieldDefinition.min ));
//                     detailCalculatedAmount.push({ name : fieldDefinition.name  , quantity : valueToCalculateOn , minUnit : fieldDefinition.min , pricePerMinUnit: fieldDefinition.price })

//                 }

//              }
 

//       }
// if (isSuvSelected) {
//     const suvInfo = await Activity_Malik.findOne({ _id: activityId }).select("PrivateSUV name");
    
//     if (!suvInfo?.PrivateSUV?.available) {
//         throw new Error("SUV is not available");
//     }

//     // Use the totalPassanger parameter you passed into the function
//     const seats = suvInfo.PrivateSUV.seat;
//     if (!seats || seats <= 0) throw new Error("SUV configuration error");

//     // Use Math.ceil for perfect rounding
//     const totalSuvRequired = Math.ceil(totalPassanger / seats);
    
//     const suvCost = suvInfo.PrivateSUV.fee * totalSuvRequired;
//     totalCalculatedAmount += suvCost;
    
//     detailCalculatedAmount.push({ 
//         name: suvInfo.name, 
//         quantity: totalSuvRequired, 
//         seatmax: seats, 
//         pricePerSuv: suvInfo.PrivateSUV.fee 
//     });
// }
//       console.log(totalCalculatedAmount)
//       return totalCalculatedAmount ;
    
// }

const validateBookingDatafn = async (BookingFiledIds, packageId, activityId, isSuvSelected) => {
    // 1. Fetch data
    const packageInfo = await Package.findById(packageId).populate('bookingFields');
    if (!packageInfo) throw new Error("Package not found");

    // 2. Base Amount starts with the package base price
    let totalAmount = packageInfo.price;
    let totalPassengers = 0;

    // 3. Extract the Vessel Multiplier (Pass 1)
    // Find the field that represents the number of yachts
    const vesselFieldDef = packageInfo.bookingFields.find(f => f.groupType === 'vessel');
    const vesselInput = BookingFiledIds.find(i => packageInfo.bookingFields.id(i.id)?.groupType === 'vessel');
    const vesselCount = vesselInput ? vesselInput.value : 1; 

    // 4. Main Calculation (Pass 2)
    for (const userInput of BookingFiledIds) {
        const field = packageInfo.bookingFields.id(userInput.id);
        const val = userInput.value;
        const price = field.price || 0;

        // --- A. DURATION LOGIC (Multiplied by Vessel Count) ---
        if (field.groupType === 'duration') {
            // Price = (Minutes / DurationPerUnit) * PricePerUnit * VesselCount
            totalAmount += (val / field.duration) * price * vesselCount;
        } 
        
        // --- B. QUANTITY LOGIC (Vessels & Adults/Children) ---
        else if (field.groupType === 'vessel' || field.groupType === 'independent') {
            // Logic: Charge only for the amount that exceeds the included quantity
            const included = field.includedQuantity || 0;
            if (val > included) {
                const extraNeeded = val - included;
                totalAmount += (extraNeeded * price);
            }
            
            // Track passengers for SUV if it's an independent field
            if (field.groupType === 'independent') totalPassengers += val;
        }
    }

    if (isSuvSelected) {
        const activity = await Activity_Malik.findById(activityId);
        const seats = activity?.PrivateSUV?.seat || 1;
        totalAmount += (Math.ceil(totalPassengers / seats) * activity?.PrivateSUV?.fee);
    }

    return totalAmount;
};

export const createOrder = async(req , res)=>{
    try{

        const {BookingFiledIds , packageId , isSuvSelected  , totalAmount  } = req.body;
        
        if(!BookingFiledIds || !packageId){
            return res.status(404).json({
                message : "booking fileds information and package id is required",
                success : false,
            });
        }

    const validateBookingData = validateBookingDatafn(  BookingFiledIds , packageId , isSuvSelected  , totalAmount)

        
    console.log(validateBookingData);

    }catch(err){
     console.log(err)
     return res.status(500).json({
        success: false,
        message: err.message
     })
    }
}