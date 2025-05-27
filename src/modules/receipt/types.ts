import { IUser } from "../../domain/User";
import { IReceipt } from "../../domain/Receipt";

export type TInsertReceipt = {
    userId: string
    user: IUser
    amount: number
    method: string
    platform: string
    paymentIndex: number
    purpose?: string  // What the payment is for (e.g., 'worker_search')
};

export type TGetReceiptById = {
    receiptId: string;
};

export type TUpdateReceiptParams = {
    receipt: IReceipt;
};

export type TUpdateReceipt = {
    receiptId: string;
    receipt: IReceipt;
    amount: number
    method: string
    platform: string
    isUsed?: boolean  // Whether the receipt has been used already
    workerCount?: number // Number of workers requested
};

export type TRemoveReceipt = {
    receiptId: string;
    receipt: IReceipt;
};

export type TGetReceiptsByUser = {
    userId: string
    user: IUser;
};

export type TUpdateReciptPayme = {
    receipt: IReceipt;
    receiptId: string
}

export type TUpdateReceiptStatus = {
    receiptId: string;
    receipt: IReceipt;
    status: string
};

export type TUpdateReceiptPaymeReceiptId = {
    receipt: IReceipt;
    paymeReceiptId: string
};

export type TGetReceiptByPaymentIndex = {
	paymentIndex: number
}