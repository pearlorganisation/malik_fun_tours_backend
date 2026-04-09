import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
<<<<<<< HEAD
    status: {
        type: String,
        enum: ['NEW', 'PENDING', 'RESOLVED'],
        default: 'NEW'
=======
    status:{
        type:String,
        enum:['NEW','PENDING','RESOLVED'],
        default:'NEW'
>>>>>>> e997436d9b09fd20b84d536f72c40e8b545e78c0
    }
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);