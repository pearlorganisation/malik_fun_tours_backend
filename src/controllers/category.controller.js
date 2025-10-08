import {
    uploadMultipleImageBuffersToCloudinary
} from "../configs/streamupload.js";
import Category from "../models/Category.js";



// ✅ Create a new category
export const createCategory = async (req, res) => {
    try {
        const {
            name,
            category_description
        } = req.body;
        console.log(req.files, "the files")
        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        let category_images = [];
        if (req.files && req.files.length > 0) {
            category_images = await uploadMultipleImageBuffersToCloudinary(req.files, "categories");
        }

        const category = await Category.create({
            name,
            category_description,
            category_images,
        });

        res.status(201).json({
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ✅ Get all categories
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({
            createdAt: -1
        });
        res.status(200).json({
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ✅ Get single category by ID
export const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category)
            return res.status(404).json({
                message: "Category not found"
            });
        res.status(200).json({
            data: category
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ✅ Update category (with optional file upload)
export const updateCategory = async (req, res) => {
    try {
        const {
            name,
            category_description
        } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category)
            return res.status(404).json({
                message: "Category not found"
            });

        let category_images = category.category_images;

        if (req.files && req.files.length > 0) {
            const uploaded = await uploadMultipleImageBuffersToCloudinary(req.files, "categories");
            category_images = [...category_images, ...uploaded];

        }

        category.name = name || category.name;
        category.category_description =
            category_description || category.category_description;
        category.category_images = category_images;

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// ✅ Delete category
export const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category)
            return res.status(404).json({
                message: "Category not found"
            });
        res.status(200).json({
            message: "Category deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};