import { Router } from 'express'
import ReceiptController from './controllers'

const router = Router({ mergeParams: true })
const ctrl = ReceiptController

// Create a new receipt and get all receipts
router.route('/')
  .post(ctrl.createReceipt)

// Get receipt by ID
router.route('/:receiptId')
  .get(ctrl.getReceiptById)

// Get receipts by user ID
router.route('/user/:userId')
  .get(ctrl.getUserReceipts)

export default router
