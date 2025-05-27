import Transaction from '../../model/Transaction'
import type {
	TCreateTransaction,
	TGetTransactionByDate,
	TGetTransactionByPaymentIndex,
	TGetTransactionByTransactionId,
	TUpdateTransactionData,
	TUpdateTransactionParams,
} from './types'

class TransactionRepo {
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

			const subscriptionTransaction = await Transaction.create({
				receipt,
				amount,
				createTime,
				transactionId,
				state,
				paymentIndex,
			})

			return subscriptionTransaction
		} catch (error: any) {
			console.log(`ERROR: [transaction.repo] create: ${error}`)
			throw error
		}
	}

	async getByTransactionId(params: TGetTransactionByTransactionId) {
		try {
			const transaction = await Transaction.findOne({
				transactionId: params.transactionId,
			})

			return transaction
		} catch (error: any) {
			console.log(`ERROR: [transaction.repo] getByTransactionId: ${error}`)
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

			const subscriptionTransaction = await Transaction.updateOne(
				{
					transactionId: transactionId,
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
			console.log(`ERROR: [transaction.repo] updateByTransactionId: ${error}`)
			throw error
		}
	}

	async getByOptoPaymentIndex(params: TGetTransactionByPaymentIndex) {
		try {
			const transaction = await Transaction.findOne({
				paymentIndex: params.paymentIndex,
			})

			return transaction
		} catch (error: any) {
			console.log(`ERROR: [transaction.repo] getByOptoPaymentIndex: ${error}`)
			throw error
		}
	}

	async getAllTransactions(data: TGetTransactionByDate) {
		try {
			const query: any = {
				isDeleted: false
			};
			const from = new Date(data.from).toISOString()
			const to = new Date(data.to).toISOString()
			console.log(`from`, from)
			console.log(`to`, to)
			if (data.from && data.to) {
				query.createdAt = {
					$gte: from,
					$lte: to,
				};
			}
			const transactions = await Transaction.find({
				...query
			})
				.populate({
					path: "receipt",
					populate: {
						path: "client",
					},
				});

			return transactions;
		} catch (error: any) {
			console.log(`ERROR: [transaction.repo] getAllTransactions: ${error}`)
			throw error
		}
	}

}

export default TransactionRepo
