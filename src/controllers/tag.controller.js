import Tag from "../models/Tag.js";

// Create Tag
export const createTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name)
      return res.status(400).json({ success: false, message: "Name is required" });

    const exists = await Tag.findOne({ name });
    if (exists)
      return res.status(400).json({ success: false, message: "Tag already exists" });

    const tag = await Tag.create({ name });

    res.status(201).json({ success: true,message : "Tag created succesfully " , data: tag });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Tags
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });

    res.json({ success: true, message : "Tag fetched succesfully " ,data: tags });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
