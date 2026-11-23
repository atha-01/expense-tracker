import express from 'express';
import { getAccounts, addAccount,updateAccount,  deleteAccount } from '../controllers/accountController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',       protect, getAccounts);
router.post('/',      protect, addAccount);
router.put('/:id',    protect, updateAccount);
router.delete('/:id', protect, deleteAccount);

export default router;