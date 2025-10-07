import express from 'express'
import {
    upload
} from '../middlewares/multer.js'
import {
    create_package , get_all_packages , delete_package , update_package , get_package_by_id
} from '../controllers/package.controller.js'
const router = express.Router()

router.patch(
  `/update/:id`,
  upload.fields([{ name: "package_images", maxCount: 10 }]),
  update_package
);
//create and get all packages
router.route(`/`).post(upload.fields([{
    name: "package_images",
    maxCount: 10
}]), create_package).get(get_all_packages)


//delete a package
router.route(`/:id`).delete(delete_package)

//edit a package 
 

//GET PACKAGE BY ID
router.get(
  `/:id`,
  get_package_by_id
);


export default router