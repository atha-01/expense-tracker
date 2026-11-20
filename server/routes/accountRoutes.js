import express from 'express';
import { getAccounts, addAccount, deleteAccount } from '../controllers/accountController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',       protect, getAccounts);
router.post('/',      protect, addAccount);
router.delete('/:id', protect, deleteAccount);

export default router;