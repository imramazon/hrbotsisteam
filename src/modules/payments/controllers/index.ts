import type { Request, Response } from 'express'
import PaymentService from '../services/index'

class PaymentContoller {
	async activatePayme(req: Request, res: Response) {
		try {
			const data = await PaymentService.activateBrandPaymeConfiguration(
				req.body,
			)

			res.status(200).send(data)
		} catch (error: any) {
			res.status(500).send({ msg: 'SERVER_ERROR', data: null })
			throw new Error(
				`PaymentController controller [activatePayme] error: ${error}`,
			)
		}
	}
}

export default new PaymentContoller()
