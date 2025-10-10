import mongoose, { Schema } from 'mongoose'

const activity_schema=new mongoose.Schema({
    activity_name:{type:String, required:true ,index: true},
    activity_images:[{
        secure_url:{type:String},
        public_id:{type:String}
    }],
    activity_description:{type:String,required:true},

    activity_meta_details:[{
        title:{type:String},
        mini_description:{type:String}
    }],
    activity_category:{type:String},
    indexed_splitted_activity_name: [{ type: String, index: true }],

    activity_options:[{
        title:{type:String},
        description:{type:String},
        duration:{type:String},
        guide:{type:String },
        activity_type:{type:String},
        activity_timings:{ 
            isMorning:{type:Boolean},
            isEvening:{type:Boolean}
        },
        prices:{
            adult:{type:Number},
            child:{type:Number},
            infant:{type:Number}
        },
        rating: { type: Number, min: 0, max: 5 },
        isAvailable:{type:Boolean}
     }],

     activity_location:
             {
                 location_name:{type:String},
                 location: {
                         type: {
                             type: String,
                             enum: ["Point"],
                             default: "Point"
                         },
                         coordinates: {
                             type: [Number],
                             required: true
                         }
                 },
             },

     activity_highlights:{type:String},
     important_information:[String],
     not_suitable_for:[String],
     destination:{
        type:Schema.Types.ObjectId,
        ref: "Destination",
        index:true
     }
     },
     {
       timestamps:true
     })


    activity_schema.index({ "itinerary.location": "2dsphere" });

    activity_schema.pre("save",function(next){
      if(this.isModified("activity_name")||this.isNew){
        const name = this.activity_name.toLowerCase().replace(/\s+/g, "");
        const substrings = new Set()

        for(let len=2; len<=5;len++){ 
            for(let i=0;i<=name.length-len;i++){
                substrings.add(name.substring(i, i+len))
            }
        }
        this.indexed_splitted_activity_name = Array.from(substrings)
      }
      next();
    })


    export const Activity = mongoose.model("Activity", activity_schema)
