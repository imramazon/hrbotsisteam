import { Router } from 'express'

import activatePaymeAuth from '../../../middlewares/activatePayme'
import PaymentController from '../controllers/index'

const router = Router({ mergeParams: true })
const ctrl = PaymentController

router.route('/activa-payme').post(activatePaymeAuth, ctrl.activatePayme)

export default router
