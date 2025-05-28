import { Router } from 'express';
import workRoutes from '../modules/work/route';
import receiptRoutes from '../modules/receipt/routes';
import paymentRoutes from '../modules/payments/routes';

const router = Router();

// API Routes
router.use('/api/works', workRoutes);
router.use('/api/receipts', receiptRoutes);
router.use('/api/payments', paymentRoutes);

export default router;
