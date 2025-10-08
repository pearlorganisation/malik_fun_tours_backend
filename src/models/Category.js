import mongoose from "mongoose"

const category_schema = new mongoose.Schema({
    name:{type:String, required:true, index:true , unique:true},
    category_images:[{
        secure_url:{type:String},
        public_id:{type:String}
    }],
    category_description:{type:String}
},{
    timestamps:true
})

const Category = mongoose.model("Category",category_schema)
export default Category