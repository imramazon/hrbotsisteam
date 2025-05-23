import type { IReceipt } from './Receipt'

export enum ETransactionState {
	Paid = '2',
	Pending = '1',
	PendingCanceled = '-1',
	PaidCanceled = '-2',
}

export interface ITransaction {
	id: string
	receipt: IReceipt
	createdAt: Date
	isDeleted: boolean
	amount: number
	state: ETransactionState
	reason: number
	transactionId: string
	transaction: string
	createTime: string
	performTime: string
	cancelTime: string
	paymentIndex: number
}
