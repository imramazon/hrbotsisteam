import type { Request, Response } from 'express'
import ReceiptService from './service'

class ReceiptController {
  async createReceipt(req: Request, res: Response) {
    try {
      const { userId, amount, method, platform } = req.body

      if (!userId || !amount || !method || !platform) {
        res.status(400).send({
          msg: 'VALIDATION_ERROR',
          data: null,
          errors: {
            userId: !userId ? 'User ID is required' : undefined,
            amount: !amount ? 'Amount is required' : undefined,
            method: !method ? 'Payment method is required' : undefined,
            platform: !platform ? 'Platform is required' : undefined
          }
        })
        return
      }

      // We'll pass the userId, service will fetch the user internally
      const receipt = await ReceiptService.insertReceipt({
        userId,
        amount,
        method,
        platform,
        paymentIndex: 0, // This will be overwritten by the service
        user: null as any // This will be populated by the service
      })

      if (!receipt) {
        res.status(404).send({
          msg: 'NOT_FOUND',
          data: null
        })
        return
      }

      res.status(201).send({
        msg: 'SUCCESS',
        data: receipt
      })
    } catch (error: any) {
      console.error(`ERROR: [ReceiptController] createReceipt: ${error}`)
      res.status(500).send({ 
        msg: 'SERVER_ERROR', 
        data: null 
      })
      throw new Error(
        `ReceiptController [createReceipt] error: ${error}`
      )
    }
  }

  async getReceiptById(req: Request, res: Response) {
    try {
      const { receiptId } = req.params

      if (!receiptId) {
        res.status(400).send({
          msg: 'VALIDATION_ERROR',
          data: null,
          errors: {
            receiptId: 'Receipt ID is required'
          }
        })
        return
      }

      const receipt = await ReceiptService.getReceiptById({ receiptId })

      if (!receipt) {
        res.status(404).send({
          msg: 'NOT_FOUND',
          data: null
        })
        return
      }

      res.status(200).send({
        msg: 'SUCCESS',
        data: receipt
      })
    } catch (error: any) {
      console.error(`ERROR: [ReceiptController] getReceiptById: ${error}`)
      res.status(500).send({ 
        msg: 'SERVER_ERROR', 
        data: null 
      })
      throw new Error(
        `ReceiptController [getReceiptById] error: ${error}`
      )
    }
  }

  async getUserReceipts(req: Request, res: Response) {
    try {
      const { userId } = req.params

      if (!userId) {
        res.status(400).send({
          msg: 'VALIDATION_ERROR',
          data: null,
          errors: {
            userId: 'User ID is required'
          }
        })
        return
      }

      const receipts = await ReceiptService.getReceiptsByUser({ userId, user: null as any })

      if (!receipts) {
        res.status(404).send({
          msg: 'NOT_FOUND',
          data: null
        })
        return
      }

      res.status(200).send({
        msg: 'SUCCESS',
        data: receipts
      })
    } catch (error: any) {
      console.error(`ERROR: [ReceiptController] getUserReceipts: ${error}`)
      res.status(500).send({ 
        msg: 'SERVER_ERROR', 
        data: null 
      })
      throw new Error(
        `ReceiptController [getUserReceipts] error: ${error}`
      )
    }
  }
}

export default new ReceiptController()
