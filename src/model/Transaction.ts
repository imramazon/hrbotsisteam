import { Schema, model } from 'mongoose'
import type { ITransaction } from '../domain/Transaction'

const TransactionSchema = new Schema<ITransaction>(
    {
        receipt: {
            type: Schema.Types.ObjectId,
            ref: 'Receipt',
        },
        amount: {
            type: Number,
        },
        state: {
            type: String,
        },
        reason: {
            type: Number,
        },
        transactionId: {
            type: String,
        },
        createTime: {
            type: String,
        },
        performTime: {
            type: String,
        },
        cancelTime: {
            type: String,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        paymentIndex: {
            type: Number,
        }
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

export default model<ITransaction>('Transaction', TransactionSchema)
