import moongoose from 'mongoose';

const contactSchema = new moongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true
    },
    phone:{
        type:String,
        required:true,
        trim:true
    },
    status:{
        type:String,
        enum:['NEW','PENDING','RESOLVED'],
        default:'NEW'
    }

}, { timestamps: true }
)

export default moongoose.model('Contact', contactSchema);