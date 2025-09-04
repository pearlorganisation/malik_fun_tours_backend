import mongoose from 'mongoose'

const tour_schema = new mongoose.Schema({
    package_name:{type:String, required:true, index:true},
    package_images:[{
        secure_url:{type:String},
        public_id:{type:String}
    }],
    package_description:{type:String,required:true},
    package_meta_details:[{
        title:{type:String},
        mini_description:{type:String}
    }],
    package_category:{type:String},
    indexed_splitted_package_name:[{type:String, index:true}],
    package_options:[{
        title:{type:String},
        description:{type:String},
        duration:{type:String},
        guide:{type:String },
        tour_type:{type:String},
        tour_timings:[{ type:String }],
        prices:{
            adult:{type:Number},
            child:{type:Number},
            infant:{type:Number}
        },
        isAvailable:{type:Boolean}
     }],
     itinerary:[
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
            }
        }
     ],
     package_highlights:{type:String},
     inclusions:[String],
     exclusions:[String],
     important_information:[String],
     not_suitable_for:[String]

},{
    timestamps:true
})

tour_schema.index({ "itinerary.location": "2dsphere" });

/** pre save hook for saving the indexed search name */
//test commit

tour_schema.pre("save",function(next){
      if(this.isModified("package_name")||this.isNew){
        const name = this.package_name.toLowerCase().replace(/\s+/g, "");
        const substrings = new Set()

        for(let len=2; len<=5;len++){
            for(let i=0;i<=name.length-len;i++){
                substrings.add(name.substring(i, i+len))
            }
        }
        this.indexed_splitted_package_name = Array.from(substrings)
      }
      next();
})

export const Package = mongoose.model("Package",tour_schema)