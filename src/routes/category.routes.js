import express from "express"
import { upload } from "../middlewares/multer.js"
import { createCategory, deleteCategory, getAllCategories, getCategoryById, updateCategory } from "../controllers/category.controller.js"
const router = express.Router()

router.route(`/`).post(upload.array("category_images",4),createCategory).get(getAllCategories)

router.route(`/:id`).get(getCategoryById).patch(updateCategory).delete(deleteCategory)

export default router

