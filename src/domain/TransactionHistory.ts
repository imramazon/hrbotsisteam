import type { IUser } from './User'
import type { ICurrency } from './Currency'

export enum Status {
	pending = 'pending',
	paid = 'paid',
	overdue = 'overdue',
}

export enum PaymentMethod {
	card = 'card',
	cash = 'cash',
}

export interface ITransactionHistory {
	id: string
	createdAt: Date
	updatedAt: Date
	duePaymentDate: Date
	user: IUser
	index: number
	status: Status
	paymentMethod: PaymentMethod
	paymentAmount: number
	receivedAmount: number
	currency: ICurrency
	cardNumber: string
	isDeleted: boolean
}
