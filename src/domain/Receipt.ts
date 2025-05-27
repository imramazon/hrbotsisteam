import { IUser } from "./User";

export interface IReceipt {
    user: IUser
    amount: number
    method: "card" | "p2p" | "paymeUrl" | "clickUrl"
    platform: "payme" | "admin" | "click"
    _id: string
    id: string
    createdAt: Date
    updatedAt: Date
    isDeleted: boolean
    createdBy: IUser
    status: "paid" | "unpaid"
    receiptId: string
    paymentIndex: number
    purpose?: string  // What the payment is for (e.g., 'worker_search')
    isUsed?: boolean  // Whether the receipt has been used already
    workerCount?: number // Number of workers requested
}