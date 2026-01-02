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

// Update the status of a specific query by ID    
router.patch('/status/:id/', updateQueryStatus);    


export default router;    