import express from 'express';
import { getBills, addBill, updateBillStatus, deleteBill } from '../controllers/billController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/',           protect, getBills);
router.post('/',          protect, addBill);
router.put('/:id',        protect, updateBillStatus);
router.delete('/:id',     protect, deleteBill);

export default router;