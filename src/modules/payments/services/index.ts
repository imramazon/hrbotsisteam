import { configurations } from '../../../config/index'
import PaymeErrors from '../../../integration/payme/constants/payme-errors'
import PaymeMethod from '../../../integration/payme/constants/payment-methods'
import TransactionState from '../../../integration/payme/constants/transaction-states'
import ReceiptService from '../../receipt/service'
import TransactionService from '../../transaction/service'
import { sendTelegramMessage } from '../../../utils/sendTelegramMessage'
class PaymentsService {
	async activateBrandPaymeConfiguration(data: any) {
		try {
			const { method, params, id } = data
			switch (method) {
				case PaymeMethod.CheckPerformTransaction: {
					return this.checkPerformTransaction(params, id)
				}

				case PaymeMethod.CreateTransaction: {
					return this.createTransaction(params, id)
				}

				case PaymeMethod.PerformTransaction: {
					return this.performTransaction(params, id)
				}

				case PaymeMethod.CancelTransaction: {
					return this.cancelTransaction(params, id)
				}

				case PaymeMethod.CheckTransaction: {
					return this.checkTransaction(params, id)
				}

				case PaymeMethod.GetStatement: {
					return this.getStatement(params)
				}
			}
		} catch (error) {
			console.error('Error in activateBrandPaymeConfiguration:', error)
			return {
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}

	private async checkPerformTransaction(params: any, id: any) {
		try {
			let { amount } = params

			amount = Math.floor(amount / 100)

			if (!params.account.order_id) {
				return {
					id: id,
					error: {
						code: PaymeErrors.OrderNotFound.code,
						message: PaymeErrors.OrderNotFound.message,
					},
				}
			}

			const receipt = await ReceiptService.getReceiptByPaymentIndex({
				paymentIndex: params.account.order_id,
			})

			if (!receipt) {
				return {
					id: id,
					error: {
						code: PaymeErrors.BrandNotFound.code,
						message: PaymeErrors.BrandNotFound.message,
					},
				}
			}

			const price = Math.floor(receipt.amount)

			if (amount != price) {
				return {
					id: id,
					error: {
						code: PaymeErrors.InvalidAmount.code,
						message: PaymeErrors.InvalidAmount.message,
					},
				}
			}

			return {
				result: {
					allow: true,
					detail: {
						receipt_type: 0,
						items: [
							{
								title: 'Service charge',
								price: amount * 100,
								count: 1,
								code: '10305008003000000',
								vat_percent: 0,
								package_code: '1546450',
							},
						],
					},
				},
			}
		} catch (error) {
			console.error('Error in checkPerformTransaction:', error)
			return {
				id: id,
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}

	private async createTransaction(params: any, ids: any) {
		try {
			const { id } = params
			const {
				account: { order_id },
				time,
			} = params
			let { amount } = params
			amount = Math.floor(amount / 100)

			const resultOfPerformTransaction = await this.checkPerformTransaction(
				params,
				id,
			)

			if (!resultOfPerformTransaction.result) {
				return resultOfPerformTransaction
			}

			let transaction = await TransactionService.getByTransactionId({
				transactionId: id,
			})

			if (transaction) {
				if (Number.parseInt(transaction.state, 10) !== TransactionState.Pending) {
					return {
						id: id,
						error: {
							code: PaymeErrors.CantDoOperation.code,
							message: PaymeErrors.CantDoOperation.message,
						},
					}
				}

				const currentTime = Date.now()

				const expirationTime =
					(currentTime - Number.parseInt(transaction.createTime, 10)) / 60000 < 12 // 12m

				if (!expirationTime) {
					await TransactionService.updateByTransactionId(
						{
							transactionId: params.id,
						},
						{
							state: TransactionState.PendingCanceled,
							reason: 4,
						},
					)

					return {
						id: id,
						error: {
							code: PaymeErrors.CantDoOperation.code,
							message: PaymeErrors.CantDoOperation.message,
						},
					}
				}

				return {
					result: {
						create_time: Number.parseInt(transaction.createTime),
						transaction: transaction.transactionId,
						state: TransactionState.Pending,
					},
				}
			}

			transaction = await TransactionService.getByOptoPaymentIndex({
				paymentIndex: order_id,
			})

			if (transaction) {
				if (Number.parseInt(transaction.state, 10) === TransactionState.Paid)
					return {
						id: id,
						error: {
							code: PaymeErrors.AlreadyDone.code,
							message: PaymeErrors.AlreadyDone.message,
						},
					}

				if (Number.parseInt(transaction.state, 10) === TransactionState.Pending) {
					return {
						id: id,
						error: {
							code: PaymeErrors.Pending.code,
							message: PaymeErrors.Pending.message,
						},
					}
				}
			}

			const receipt = await ReceiptService.getReceiptByPaymentIndex({
				paymentIndex: order_id,
			})

			if (!receipt) {
				return {
					id: id,
					error: {
						code: PaymeErrors.BrandNotFound.code,
						message: PaymeErrors.BrandNotFound.message,
					},
				}
			}

			const newTransaction = await TransactionService.create({
				state: TransactionState.Pending.toString(),
				amount,
				receipt: receipt,
				createTime: time,
				transactionId: id,
				paymentIndex: order_id,
			})

			let receivers = [
				{
					id: configurations.payme.merchantId,
					amount: receipt.amount * 100,
				},
			]

			return {
				result: {
					create_time: Number.parseInt(newTransaction.createTime),
					transaction: newTransaction.transactionId,
					state: TransactionState.Pending,
					// receivers,
				},
			}
		} catch (error) {
			console.error('Error in createTransaction:', error)
			return {
				id: ids,
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}

	private async performTransaction(params: any, id: any) {
		try {
			const currentTime = Date.now()
			let { amount } = params
			const transaction = await TransactionService.getByTransactionId({
				transactionId: params.id,
			})

			if (!transaction) {
				return {
					id: id,
					error: {
						code: PaymeErrors.OrderNotFound.code,
						message: PaymeErrors.OrderNotFound.message,
					},
				}
			}
			const receipt = await ReceiptService.getReceiptByPaymentIndex({
				paymentIndex: transaction?.paymentIndex,
			})
			if (Number.parseInt(transaction.state, 10) !== TransactionState.Pending) {
				if (Number.parseInt(transaction.state, 10) !== TransactionState.Paid) {
					return {
						id: id,
						error: {
							code: PaymeErrors.CantDoOperation.code,
							message: PaymeErrors.CantDoOperation.message,
						},
					}
				}

				return {
					result: {
						perform_time: Number.parseInt(transaction.performTime, 10),
						transaction: transaction.transactionId,
						state: TransactionState.Paid,
					},
				}
			}

			const expirationTime =
				(currentTime - Number.parseInt(transaction.createTime, 10)) / 60000 < 12 // 12m

			if (!expirationTime) {
				await TransactionService.updateByTransactionId(
					{
						transactionId: params.id,
					},
					{
						state: TransactionState.PendingCanceled,
						reason: 4,
						cancelTime: currentTime.toString(),
					},
				)

				return {
					id: id,
					error: {
						code: PaymeErrors.CantDoOperation.code,
						message: PaymeErrors.CantDoOperation.message,
					},
				}
			}

			const time: string = new Date().toTimeString().split(' ')[0]
			const date: string = new Date().toISOString().split('T')[0]
			console.log(receipt)
			
			// Check if user exists and has required properties
			const userId = receipt.user ? receipt.user._id?.toString() || 'Unknown' : 'Unknown'
			const userName = receipt.user ? receipt.user.fullName || 'Unknown User' : 'Unknown User'
			
			const message = `
			🧾 ${userId}
			👤 ${userName}
			💳 ${null}
			🇺🇿 ${receipt.amount}сум
			🕓 ${time} ${date}
			✅Успешная оплата`

			await sendTelegramMessage(message)
			await ReceiptService.updateReceiptStatus({
				receipt: receipt,
				status: "paid",
				receiptId: receipt._id.toString()
			})

			await TransactionService.updateByTransactionId(
				{
					transactionId: params.id,
				},
				{
					state: TransactionState.Paid,
					performTime: currentTime.toString(),
				},
			)

			return {
				result: {
					transaction: transaction.transactionId,
					perform_time: currentTime,
					state: TransactionState.Paid,
				},
			}
		} catch (error) {
			console.error('Error in performTransaction:', error)
			return {
				id: id,
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}

	private async cancelTransaction(params: any, id: any) {
		try {
			const transaction = await TransactionService.getByTransactionId({
				transactionId: params.id,
			})

			if (!transaction) {
				return {
					id: id,
					error: {
						code: PaymeErrors.OrderNotFound.code,
						message: PaymeErrors.OrderNotFound.message,
					},
				}
			}

			const currentTime = Date.now()

			if (Number.parseInt(transaction.state, 10) > 0) {
				await TransactionService.updateByTransactionId(
					{
						transactionId: params.id,
					},
					{
						state: -Math.abs(Number.parseInt(transaction.state, 10)),
						reason: params.reason,
						cancelTime: currentTime.toString(),
					},
				)
			}

			return {
				result: {
					cancel_time: Number.parseInt(transaction.cancelTime, 10) || currentTime,
					transaction: transaction.transactionId,
					state: -Math.abs(Number.parseInt(transaction.state)),
				},
			}
		} catch (error) {
			console.error('Error in cancelTransaction:', error)
			return {
				id: id,
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}

	private async checkTransaction(params: any, id: any) {
		try {
			const transaction = await TransactionService.getByTransactionId({
				transactionId: params.id,
			})

			if (!transaction) {
				return {
					id: id,
					error: {
						code: PaymeErrors.OrderNotFound.code,
						message: PaymeErrors.OrderNotFound.message,
					},
				}
			}

			return {
				result: {
					create_time: Number.parseInt(transaction.createTime, 10),
					perform_time: transaction.performTime
						? Number.parseInt(transaction.performTime, 10)
						: 0,
					cancel_time: transaction.cancelTime
						? Number.parseInt(transaction.cancelTime, 10)
						: 0,
					transaction: transaction.transactionId,
					state: Number.parseInt(transaction.state, 10),
					reason: transaction.reason ? transaction.reason : null,
				},
			}
		} catch (error) {
			console.error('Error in checkTransaction:', error)
			return {
				id: id,
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}

	private async getStatement(params: { from: Date; to: Date }) {
		try {
			const allTransactions = await TransactionService.getAllTransactionsToPayme(params)

			const transactions: any = []
			if (!params.from || !params.to) {
				return {
					error: {
						code: PaymeErrors.OrderNotFound.code,
						message: PaymeErrors.OrderNotFound.message,
					},
				}
			}

			for (let i = 0; i < allTransactions.length; i++) {
				transactions.push({
					id: allTransactions[i].id,
					amount: allTransactions[i].amount,
					account: {
						order_id: allTransactions[i].receipt.paymentIndex.toString(),
					},
					time: +allTransactions[i].createTime,
					transaction: allTransactions[i].transactionId,
					state: +allTransactions[i].state,
					reason: allTransactions[i].reason || null,
					create_time: +allTransactions[i].createTime,
					cancel_time: +allTransactions[i].cancelTime || 0,
					perform_time: +allTransactions[i].performTime || 0,
				})
			}

			return {
				result: {
					transactions,
				},
			}
		} catch (error) {
			console.error('Error in getStatement:', error)
			return {
				error: {
					code: PaymeErrors.SystemError.code,
					message: PaymeErrors.SystemError.message,
				},
			}
		}
	}
}

export default new PaymentsService()
