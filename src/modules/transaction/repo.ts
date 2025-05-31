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
			let query: any = {
				isDeleted: false
			};

			// Get the from and to timestamps as numbers (milliseconds)
			const fromTimestamp = data.from instanceof Date ? data.from.getTime() : Number(data.from);
			const toTimestamp = data.to instanceof Date ? data.to.getTime() : Number(data.to);

			console.log(`fromTimestamp:`, fromTimestamp);
			console.log(`toTimestamp:`, toTimestamp);

			if (fromTimestamp && toTimestamp) {
				// Convert timestamps to ensure numeric comparison when filtering
				const fromStr = fromTimestamp.toString();
				const toStr = toTimestamp.toString();
				
				// The createTime field could be stored as either a number or a string
				// We need to handle both cases for proper comparison
				query = {
					$and: [
						{ isDeleted: false },
						{ $or: [
							// Option 1: createTime is stored as a string - convert to number for comparison
							{ createTime: { $gte: fromStr, $lte: toStr } },
							// Option 2: convert createTime to number before comparison
							{ $expr: { $and: [
								{ $gte: [{ $toDouble: "$createTime" }, fromTimestamp] },
								{ $lte: [{ $toDouble: "$createTime" }, toTimestamp] }
							]}},
							// Option 3: Also check createdAt as a fallback (MongoDB date field)
							{ createdAt: { $gte: new Date(fromTimestamp), $lte: new Date(toTimestamp) } }
						]}
					]
				};
			}

			console.log('Query:', JSON.stringify(query));
			
			const transactions = await Transaction.find(query)
				.populate({
					path: "receipt",
					// populate: {
					// 	path: "user",
					// },
				});

			console.log(`Found ${transactions.length} transactions`); 
			return transactions;
		} catch (error: any) {
			console.log(`ERROR: [transaction.repo] getAllTransactions: ${error}`)
			throw error
		}
	}

}

export default TransactionRepo
