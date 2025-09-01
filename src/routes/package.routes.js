import express from 'express'
import {
    upload
} from '../middlewares/multer.js'
import {
    create_package
} from '../controllers/package.controller.js'
const router = express.Router()

router.route(`/`).post(upload.fields([{
    name: "package_images",
    maxCount: 10
}]), create_package)
export default router