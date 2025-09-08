import express from 'express'
import {
    upload
} from '../middlewares/multer.js'
import {
    create_package , get_all_packages , delete_package , update_package
} from '../controllers/package.controller.js'
const router = express.Router()

//create and get all packages
router.route(`/`).post(upload.fields([{
    name: "package_images",
    maxCount: 10
}]), create_package).get(get_all_packages)


//delete a package
router.route(`/:id`).delete(delete_package)

//edit a package 
router.patch(
  `/update/:id`,
  upload.fields([{ name: "package_images", maxCount: 10 }]),
  update_package
);


export default router