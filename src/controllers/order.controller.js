import mongoose from "mongoose";
import Package from "../models/Admin/package.model.js";
import Activity_Malik from "../models/Admin/activity.model.js"
import Addon from "../models/Admin/addons.model.js"
import Booking from "../models/Booking.js";
import stripe from "../configs/stripe.js";



const validateBookingDatafn = async(  BookingFiledIds , packageId , addons , activityId, isSuvSelected )=>{
    let totalCalculatedAmount  = 0 
    let detailCalculatedAmount = [];
    let extraDurationFieldPrice =0
    let totalExtraMember =0
    let minQuantityPrice = 0 
    let totalRequiredseat = 0;
    let minPrice = 0 
    let  totalExtraMinX =0 
    let minValue = 0
    let newPrice = 0 

    const packageInfo = await Package.findOne({ _id: packageId, activityId: activityId, isActive: true })
        .select("price name bookingFields");
    if (!packageInfo) {
        throw new Error("Package not found or not active");
    }
    detailCalculatedAmount.push({
  label: "Base Package",
  amount: packageInfo.price,
});
    console.log(packageInfo);

      for (const userInput of BookingFiledIds) {

         const fieldDefinition = packageInfo.bookingFields.find(
            (field) => field._id.toString() === userInput.id.toString()
        );

        if (!fieldDefinition) {
            throw new Error(`Invalid booking field ID: ${userInput.id}`);
        }

        if(fieldDefinition.min && userInput.value < fieldDefinition.min){
        throw new Error(`${fieldDefinition.name} must be at least ${fieldDefinition.min}`);
        

        }
        if (fieldDefinition.max && userInput.value > fieldDefinition.max) {
            throw new Error(`${fieldDefinition.name} cannot exceed ${fieldDefinition.max}`);
        }
          if (fieldDefinition.duration && (userInput.value < fieldDefinition.duration ||  userInput.value % fieldDefinition.duration != 0)) {
            throw new Error(`${fieldDefinition.name} must be at least ${fieldDefinition.duration} or in proper fraction`);
        }

 
            const valueToCalculateOn = userInput.value
         
        
        
        
             if(valueToCalculateOn){

                if(fieldDefinition?.duration){
                     totalExtraMinX = valueToCalculateOn / fieldDefinition?.min  
                     newPrice = (totalExtraMinX - 1) * fieldDefinition?.price

                     extraDurationFieldPrice = totalExtraMinX  * fieldDefinition?.price
                       detailCalculatedAmount.push({
               label: `${fieldDefinition.name} (Duration)`,
                amount: extraDurationFieldPrice,
               });

                }else {
                     minValue = fieldDefinition?.min > 0 ? fieldDefinition.min : 1;
                    let extraMember = valueToCalculateOn - fieldDefinition?.min
                    totalExtraMember  += extraMember/ minValue 
                    totalRequiredseat = fieldDefinition?.seat ? (fieldDefinition?.seat * (extraMember +  fieldDefinition?.min)):totalRequiredseat + extraMember +  fieldDefinition?.min
                    // totalRequiredseat = totalRequiredseat + extraMember +  fieldDefinition?.min 
                    //minQuantityPrice = fieldDefinition?.price ? fieldDefinition.price : minQuantityPrice
                    minQuantityPrice +=  totalExtraMember * fieldDefinition.price

                    
    detailCalculatedAmount.push({
      label: fieldDefinition.name,
      amount: totalExtraMember * fieldDefinition.price,
    });
  

                    //IS MAIN
                    // detailCalculatedAmount.push({ name : fieldDefinition.name  , quantity : valueToCalculateOn , minUnit : fieldDefinition.min , pricePerMinUnit: fieldDefinition.price })
                }

             }
      }

         const addonIds = addons.map(a => a.id);

const addonDocs = await Addon.find({ _id: { $in: addonIds } });

let addonPrice = 0;

for (const addon of addons) {
  const found = addonDocs.find(doc => doc._id.toString() === addon.id);

  if (found) {
    addonPrice += found.price * (addon.quantity || 1);
    
    detailCalculatedAmount.push({
      label: `Addon: ${found.title}`,
      amount:  found.price * (found.quantity || 1)
    });
  }
}
      

       if(extraDurationFieldPrice){
        console.log(extraDurationFieldPrice ,  totalExtraMember  , packageInfo?.price , (newPrice* minValue))  

        totalCalculatedAmount = extraDurationFieldPrice * totalExtraMember + packageInfo?.price + (newPrice* minValue) + addonPrice


       }else{

       totalCalculatedAmount = minQuantityPrice + packageInfo?.price + addonPrice;
         
       }

  

if (isSuvSelected) {
    const suvInfo = await Activity_Malik.findOne({ _id: activityId }).select("PrivateSUV name");
    
    if (!suvInfo?.PrivateSUV?.available) {
        throw new Error("SUV is not available");
    }
    console.log(suvInfo , "information")

    // Use the totalPassanger parameter you passed into the function
    const seats = Number(suvInfo?.PrivateSUV?.seat);
    if (!seats || seats <= 0) throw new Error("SUV configuration error");

    // Use Math.ceil for perfect rounding
    
    const totalSuvRequired = Math.ceil(totalRequiredseat / seats);

    console.log(totalSuvRequired , "req suv with total seat" , totalRequiredseat )
    
    const suvCost = suvInfo.PrivateSUV.fee * totalSuvRequired;
    totalCalculatedAmount += suvCost;
    
    detailCalculatedAmount.push({
  label: "Private SUV",
  amount: suvCost,
});
}
    //   console.log(totalCalculatedAmount , totalCalculatedAmount  )
      return {
  calculatedAmount: totalCalculatedAmount,
  breakdown: detailCalculatedAmount,
};
    
}



export const validateExistingBooking = async (bookingId, userId) => {
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
        throw new Error("Booking not found");
    }

    // Ownership check
    if (booking.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized access");
    }

    // Status check
    if (booking.paymentStatus === "paid" || booking.status === "confirmed") {
        throw new Error("This booking is already paid and confirmed.");
    }

    return booking;
};



export const createOrder = async (req, res) => {
    try {
        const { 
            BookingFiledIds, // Note: your schema calls these 'bookingFields'
            packageId, 
            activityId, 
            isSuvSelected, 
            addons = [], 
            totalAmount ,
            date ,
            time,
            bookingId 
        } = req.body;

        let existingBooking = null;

        if (bookingId) {
            existingBooking = await validateExistingBooking(bookingId, req.user._id);
        }
        

    if (!BookingFiledIds || !packageId || !activityId) {
        return res.status(400).json({
            message: "Booking fields, package ID, and activity ID are required",
            success: false,
        });
    }
    if (!date || !time) {
            return res.status(400).json({ 
                success: false, 
                message: "Date and Time are required" 
            });
        }
        // 1. Validate Business Logic (Your existing function)
        const { calculatedAmount, breakdown } = await validateBookingDatafn(
            BookingFiledIds,
            packageId,
            addons,
            activityId,
            isSuvSelected
        );

        // 2. Security Check
        if (Math.round(calculatedAmount) !== Math.round(totalAmount)) {
            return res.status(400).json({ message: "Amount mismatch", success: false , expectedAmount : calculatedAmount ,  breakdown : breakdown });
        }

        // 3. Create Stripe PaymentIntent
        // Note: Stripe requires amount in cents. If your currency is AED, 
        // 1 AED = 100 fils. Ensure you are sending the smallest unit.
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(calculatedAmount * 100), 
            currency: 'usd', // Updated to AED based on your schema default
            metadata: {
                packageId: packageId.toString(),
                userId: req.user?._id.toString()
            }
        });

        // 4. Save to Database using your specific schema fields
        // const booking = await Booking.create({
        //     user: req.user?._id,
        //     activity: activityId,
        //     packageId: packageId,
        //     bookingFields: BookingFiledIds.map(f => ({ fieldId: f.id, value: f.value })),
        //     addons: addons.map(a => ({ addonId: a.id, title: a.title, price: a.price, quantity: a.quantity })),
        //     isSuvSelected: isSuvSelected,
        //        date: new Date(date),
        //        timeSlot: time,       // 2. Add this

        //     currency: 'USD', // Update this in your DB record
        //     totalAmount: calculatedAmount,
        //     amountBreakdown: breakdown,
        //     paymentIntentId: paymentIntent.id,
        //     paymentStatus: "pending",
        //     status: "pending"
        // });

          let booking;
        if (existingBooking) {
            booking = await Booking.findByIdAndUpdate(
                bookingId,
                {
                    bookingFields: BookingFiledIds.map(f => ({ fieldId: f.id, value: f.value })),
                    addons: addons.map(a => ({ addonId: a.id, title: a.title, price: a.price, quantity: a.quantity })),
                    isSuvSelected,
                    totalAmount: calculatedAmount,
                    amountBreakdown: breakdown,
                    paymentIntentId: paymentIntent.id,
                    paymentStatus: "pending"
                },
                { new: true }
            );
        } else {
            booking = await Booking.create({
                user: req.user._id,
                activity: activityId,
                packageId,
                date: new Date(date),
                timeSlot: time,
                bookingFields: BookingFiledIds.map(f => ({ fieldId: f.id, value: f.value })),
                addons: addons.map(a => ({ addonId: a.id, title: a.title, price: a.price, quantity: a.quantity })),
                isSuvSelected,
                currency: 'USD',
                totalAmount: calculatedAmount,
                amountBreakdown: breakdown,
                paymentIntentId: paymentIntent.id,
                paymentStatus: "pending",
                status: "pending"
            });
        }
        // 5. Return success and client secret
        return res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            bookingId: booking._id
        });

    } catch (err) {
        // Handle errors from both the helper function and the controller
        console.error("Order creation error:", err);
        return res.status(err.message === "Booking not found" || err.message === "Unauthorized access" ? 403 : 500)
            .json({ success: false, message: err.message });
    }
}




export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // 1. Verify the signature using the raw body
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET
    );
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 2. Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      
      console.log(`💰 PaymentIntent for ${paymentIntent.amount} succeeded!`);

      // Update the booking status in your database
      try {
        const updatedBooking = await Booking.findOneAndUpdate(
          { paymentIntentId: paymentIntent.id },
          { 
            paymentStatus: 'paid', 
            status: 'confirmed' 
          },
          { new: true }
        );

        if (!updatedBooking) {
          console.error(`❌ Booking not found for PaymentIntent: ${paymentIntent.id}`);
        }
      } catch (dbError) {
        console.error("Database update error:", dbError);
        return res.status(500).send("Database error");
      }
      break;

    case 'payment_intent.payment_failed':
      const failedIntent = event.data.object;
      await Booking.findOneAndUpdate(
        { paymentIntentId: failedIntent.id },
        { paymentStatus: 'failed' }
      );
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // 3. Return a 200 response to acknowledge receipt
  res.json({ received: true });
};