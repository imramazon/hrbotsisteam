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
}