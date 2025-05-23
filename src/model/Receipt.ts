import { Schema, model } from "mongoose";
import { IReceipt } from "../domain/Receipt";

const receiptSchema = new Schema<IReceipt>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        amount: {
            type: Number
        },
        method: {
            type: String,
            enum: ["card", "p2p", "paymeUrl", "clickUrl"]
        },
        platform: {
            type: String,
            enum: ["payme", "admin", "click"]
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ["paid", "unpaid"],
            default: "unpaid"
        },
        receiptId: {
            type: String
        },
        paymentIndex: {
            type: Number
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
    }
)

export default model<IReceipt>("Receipt", receiptSchema);
