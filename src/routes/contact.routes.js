import Express from 'express';
import {
    getAllQueries,
    createQuery,
    updateQueryStatus
} from '../controllers/contact.controller.js';

const router = Express.Router();

router.route('/')
    .get(getAllQueries)
    .post(createQuery);

router.patch('/status/:id/', updateQueryStatus);    


export default router;    