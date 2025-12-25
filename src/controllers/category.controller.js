import { Category } from "../models/Category.js";
import {
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} from "../configs/cloudinary.js";

/* ---------------- CREATE CATEGORY ---------------- */
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Category already exists" });
    }

    let imageData = null;

    if (req.file) {
      const [uploaded] = await uploadFileToCloudinary(req.file, "categories");
      imageData = uploaded;
    }

    const category = await Category.create({
      name,
      description,
      image: imageData,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- GET ALL ---------------- */
export const getCategories = async (_, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- UPDATE ---------------- */
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (req.file) {
      // Delete old image
      if (category.image?.public_id) {
        await deleteFileFromCloudinary(category.image);
      }

      const [uploaded] = await uploadFileToCloudinary(req.file, "categories");
      category.image = uploaded;
    }

    if (name) category.name = name;
    if (description) category.description = description;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- DELETE ---------------- */
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.image?.public_id) {
      await deleteFileFromCloudinary(category.image);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ---------------- GET CATEGORY BY ID ---------------- */
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
