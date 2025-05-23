import { Schema, model } from 'mongoose'
import type { ITransactionHistory } from '../domain/TransactionHistory'

const TransactionHistory = new Schema<ITransactionHistory>(
	{
		duePaymentDate: {
			type: Date,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		index: {
			type: Number,
		},
		status: {
			type: String,
			enum: ['pending', 'paid', 'overdue'],
		},
		paymentMethod: {
			type: String,
			enum: ['card', 'cash'],
		},
		paymentAmount: {
			type: Number,
		},
		receivedAmount: {
			type: Number,
		},
		currency: {
			type: Schema.Types.ObjectId,
			ref: 'Currency',
		},
		cardNumber: {
			type: String,
		},
		isDeleted: {
			type: Boolean,
			default: false,
		},
	},
	{
		versionKey: false,
		timestamps: true,
		toObject: {
			virtuals: true,
		},
		toJSON: {
			virtuals: true,
		},
	},
)

export default model<ITransactionHistory>('TransactionHistory', TransactionHistory)
