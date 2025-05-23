import { Schema, model } from 'mongoose'
import type { ICurrency } from '../domain/Currency'

const currencySchema = new Schema<ICurrency>(
	{
		name: { type: String },
		ISOCode: { type: String },
		symbol: { type: String },
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

export default model<ICurrency>('Currency', currencySchema)
