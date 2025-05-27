import { IReceipt } from "../../domain/Receipt"

export type TCreateTransaction = {
	receipt: IReceipt
	amount: number
	createTime: string
	transactionId: string
	state?: string
	paymentIndex: number
}

export type TGetTransactionByTransactionId = {
	transactionId: string
}

export type TUpdateTransactionParams = TGetTransactionByTransactionId

export type TUpdateTransactionData = {
	state?: number
	performTime?: string
	reason?: number
	cancelTime?: string
}

export type TGetTransactionByPaymentIndex = {
	paymentIndex: number
}

export type TGetTransactionByDate = {
	from: Date
	to: Date
}
