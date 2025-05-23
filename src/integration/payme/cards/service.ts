import axios from 'axios'
import { configurations } from '../../../config/index'
import type {
	TCardGetVerifyCode,
	TCardVerify,
	TCreateCard,
	TReceiptsCreate,
	TReceiptsGet,
	TReceiptsPay,
	TReceiptsSend,
	TSetFiskalDataMethod,
} from './types'

class PaymeCards {
	private get randomId() {
		return Math.floor(100000 + Math.random() * 900000)
	}

	cardCreate(data: TCreateCard) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'cards.create',
			params: {
				card: {
					number: data.card,
					expire: data.expire,
				},
				save: true,
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'X-Auth': data.merchantId,
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json',
			},
			data: requestData,
		}

		return axios(config).then((response) => {
			const result = response.data

			if (result.error) {
				return {
					status: false,
					data: response.data,
				}
			}

			return {
				status: true,
				data: response.data,
			}
		})
	}

	cardGetVerifyCode(data: TCardGetVerifyCode) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'cards.get_verify_code',
			params: {
				token: data.token,
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'X-Auth': data.merchantId,
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json',
			},
			data: requestData,
		}

		return axios(config).then((response) => response.data)
	}

	cardVerify(data: TCardVerify) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'cards.verify',
			params: {
				token: data.token,
				code: data.code,
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'X-Auth': data.merchantId,
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json',
			},
			data: requestData,
		}

		return axios(config).then((response) => {
			const result = response.data

			if (result.error) {
				return {
					status: false,
					data: response.data,
				}
			}

			return {
				status: true,
				data: response.data,
			}
		})
	}

	receiptsCreate(data: TReceiptsCreate) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'receipts.create',
			params: {
				amount: data.amount,
				account: {
					order_id: data.order_id ? data.order_id : 0,
				},
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'X-Auth': `${data.merchantId}:${data.merchantKey}`,
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
			},
			data: requestData,
		}
		console.log(JSON.stringify(config))

		return axios(config).then((response) => {
			const result = response.data
			if (result.error) {
				return {
					status: false,
					data: response.data,
				}
			}

			return {
				status: true,
				data: response.data,
			}
		})
	}

	receiptsPay(data: TReceiptsPay) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'receipts.pay',
			params: {
				id: data.receiptId,
				token: data.token,
				payer: {
					phone: data.phone,
				},
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'X-Auth': `${data.merchantId}:${data.merchantKey}`,
				'Content-Type': 'application/json',
				'Cache-Control': 'no-cache',
			},
			data: requestData,
		}

		return axios(config).then((response) => {
			const result = response.data

			if (result.error) {
				return {
					status: false,
					data: response.data,
				}
			}

			return {
				status: true,
				data: response.data,
			}
		})
	}

	receiptsSend(data: TReceiptsSend) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'receipts.send',
			params: {
				id: data.receiptId,
				phone: data.phone,
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json',
				'X-Auth': `${data.merchantId}:${data.merchantKey}`,
			},
			data: requestData,
		}

		return axios(config)
			.then((response) => response.data)
			.catch((error) => {
				console.log(error)
			})
	}

	setFiscalData(body: TSetFiskalDataMethod) {
		const data = JSON.stringify({
			method: 'receipts.set_fiscal_data',
			params: {
				id: body.receiptId,
				type: body.type,
				fiscal_data: body.fiskalData,
			},
		})

		const config = {
			method: 'post',
			url: configurations.payme.baseUrl,
			headers: {
				'X-Auth': `${configurations.payme.merchantId}:${configurations.payme.merchantKey}`,
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json',
			},
			data: data,
		}

		axios(config)
			.then((response) => response.data)
			.catch((error) => {
				console.log(error)
				return error.data
			})
	}

	receiptsGet(data: TReceiptsGet) {
		const requestData = JSON.stringify({
			id: this.randomId,
			method: 'receipts.get',
			params: {
				id: data.receiptId,
			},
		})

		const config = {
			method: 'post',
			url: data.paymeUrl,
			headers: {
				'Cache-Control': 'no-cache',
				'Content-Type': 'application/json',
				'X-Auth': `${data.merchantId}:${data.merchantKey}`,
			},
			data: requestData,
		}

		return axios(config)
			.then((response) => response.data)
			.catch((error) => {
				// console.log(error)
			})
	}
}

export default new PaymeCards()
