import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Published'], default: 'Published' },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: String
  }
}, { timestamps: true });

const Page = mongoose.model("Page", pageSchema);
export default Page;