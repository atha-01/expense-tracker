import express from 'express';
import { getBudget, saveBudget } from '../controllers/budgetController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',  protect, getBudget);
router.post('/', protect, saveBudget);

export default router;