export type TCreateCard = {
	card: string
	expire: string
	merchantId?: string
	merchantKey?: string
	paymeUrl: string
}

export type TCardGetVerifyCode = {
	token: string
	paymeUrl: string
	merchantId?: string
}

export type TCardVerify = {
	token: string
	code: string
	paymeUrl: string
	merchantId?: string
}

export type TReceiptsCreate = {
	amount: number
	order_id?: number
	paymeUrl?: string
	merchantKey?: string
	merchantId?: string
}

export type TReceiptsPay = {
	receiptId: string
	token: string
	phone: string
	paymeUrl?: string
	merchantKey?: string
	merchantId?: string
}

export type TReceiptsSend = {
	receiptId: string
	phone: string
	paymeUrl: string
	merchantKey?: string
	merchantId?: string
}

export type TFiskalData = {
	receipt_id: number
	status_code: number
	message: string
	terminal_id: string
	fiscal_sign: string
	qr_code_url: string
	date: string
}

export type TSetFiskalDataMethod = {
	receiptId: number
	type: string
	fiskalData: TFiskalData
}

export type TReceiptsGet = {
	receiptId: string
	paymeUrl: string
	merchantKey?: string
	merchantId?: string
}
