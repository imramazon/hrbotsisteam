import TransactionRepo from './repo'
import type {
	TCreateTransaction,
	TGetTransactionByDate,
	TGetTransactionByPaymentIndex,
	TGetTransactionByTransactionId,
	TUpdateTransactionData,
	TUpdateTransactionParams,
} from './types'

const repo = new TransactionRepo()

class TransactionService {
	async create(data: TCreateTransaction) {
		try {
			const {
				receipt,
				amount,
				createTime,
				transactionId,
				state,
				paymentIndex,
			} = data

			const transaction = await repo.create({
				receipt,
				amount,
				createTime,
				transactionId,
				state,
				paymentIndex,
			})

			return transaction
		} catch (error: any) {
			console.log(`ERROR: [transaction.service] create: ${error}`)
			throw error
		}
	}

	async getByTransactionId(params: TGetTransactionByTransactionId) {
		try {
			const subscriptionTransaction = await repo.getByTransactionId(params)

			return subscriptionTransaction
		} catch (error: any) {
			console.log(`ERROR: [transaction.service] getByTransactionId: ${error}`)
			throw error
		}
	}

	async updateByTransactionId(
		params: TUpdateTransactionParams,
		data: TUpdateTransactionData,
	) {
		try {
			const { transactionId } = params
			const { state, performTime, reason, cancelTime } = data

			const subscriptionTransaction = await repo.updateByTransactionId(
				{
					transactionId,
				},
				{
					state,
					performTime,
					reason,
					cancelTime,
				},
			)

			return subscriptionTransaction
		} catch (error: any) {
			console.log(
				`ERROR: [transaction.service] updateByTransactionId: ${error}`,
			)
			throw error
		}
	}

	async getByOptoPaymentIndex(params: TGetTransactionByPaymentIndex) {
		try {
			const subscriptionTransaction = await repo.getByOptoPaymentIndex(params)

			return subscriptionTransaction
		} catch (error: any) {
			console.log(
				`ERROR: [transaction.service] getByOptoPaymentIndex: ${error}`,
			)
			throw error
		}
	}

	async getAllTransactions(data: TGetTransactionByDate) {
		try {
			const result = await repo.getAllTransactions(data)
			return result
		} catch (error: any) {
			console.log(`ERROR: [transaction.service] getByOptoPaymentIndex: ${error}`)
			return error
		}
	}

	async getAllTransactionsToPayme(data: TGetTransactionByDate) {
		const result = await repo.getAllTransactions(data)
		return result
	}
}

export default new TransactionService()
