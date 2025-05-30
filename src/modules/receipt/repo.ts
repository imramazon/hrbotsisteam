import Receipt from "../../model/Receipt";
import { TGetReceiptById, TInsertReceipt, TRemoveReceipt, TUpdateReceipt, TUpdateReceiptParams, TGetReceiptsByUser, TUpdateReciptPayme, TUpdateReceiptStatus, TUpdateReceiptPaymeReceiptId, TGetReceiptByPaymentIndex } from "./types";

class ReceiptRepository {
    async insertReceipt(data: TInsertReceipt) {
        try {
            const newReceipt = new Receipt(data);

            const paymentIndex = await Receipt.find({}).countDocuments()

            newReceipt.paymentIndex = paymentIndex + 1

            await newReceipt.save();

            return newReceipt;
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] insertReceipt: ${error}`);
            throw error;
        }
    }

    async getReceiptById(data: TGetReceiptById) {
        try {
            const { receiptId } = data;

            return await Receipt.findOne({ _id: receiptId, isDeleted: false });
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] getReceiptById: ${error}`);
            throw error;
        }
    }

    async updateReceipt(params: TUpdateReceiptParams, data: TUpdateReceipt) {
        try {
            const { receipt } = params;

            return await Receipt.findOneAndUpdate(
                { _id: receipt.id, isDeleted: false },
                {
                    ...data
                }
            );
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] updateReceipt: ${error}`);
            throw error;
        }
    }

    async removeReceipt(data: TRemoveReceipt) {
        try {
            const { receipt } = data;

            return Receipt.findOneAndUpdate({ _id: receipt.id }, { isDeleted: true });
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] removeReceipt: ${error}`);
            throw error;
        }
    }

    async getReceipts() {
        try {
            const receiptQuery = Receipt.find({
                isDeleted: false,
            })
            return await receiptQuery.exec();
        } catch (error) {
            console.error(`ERROR: [receipt.repo] getReceipts: ${error}`);
            throw error;
        }
    }

    async getReceiptsByUser(data: TGetReceiptsByUser) {
        try {
            const receiptQuery = Receipt.find({
                user: data.user.id,
                isDeleted: false,
            })
            return await receiptQuery.exec();
        } catch (error) {
            console.error(`ERROR: [receipt.repo] getReceiptsByUser: ${error}`);
            throw error;
        }
    }
    async getReceiptCount() {
        try {
            return await Receipt.find({}).countDocuments()
        } catch (error) {
            console.error(`ERROR: [receipt.repo] getReceiptCount: ${error}`);
            throw error;
        }
    }

    async updateReceiptPayme(data: TUpdateReciptPayme) {
        return await Receipt.findOneAndUpdate(
            { _id: data.receipt._id, isDeleted: false },
            { 'receiptId': data.receiptId },
        )
    }
    async updateReceiptStatus(data: TUpdateReceiptStatus) {
        try {
            const { receipt } = data;

            return await Receipt.findOneAndUpdate(
                { _id: receipt.id, isDeleted: false },
                {
                    status: data.status
                }
            );
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] updateReceiptStatus: ${error}`);
            throw error;
        }
    }
    async updateReceiptPaymeReceiptId(data: TUpdateReceiptPaymeReceiptId) {
        try {
            const { receipt } = data;
            console.log(receipt);
            return await Receipt.findOneAndUpdate(
                {
                    _id: receipt.id,
                    isDeleted: false,
                    receiptId: { $exists: false }
                },
                {
                    $set: { receiptId: data.paymeReceiptId }
                },
                { new: true }
            );
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] updateReceiptPaymeReceiptId: ${error}`);
            throw error;
        }
    }

    async getReceiptByPaymentIndex(data: TGetReceiptByPaymentIndex) {
        try {
            const { paymentIndex } = data
            
            // Find receipt first to make sure it exists
            const receipt = await Receipt.findOne({ paymentIndex: +data.paymentIndex })
            
            if (!receipt) {
                console.log(`Receipt with paymentIndex ${paymentIndex} not found`)
                return null
            }
            
            // Now populate with user data using path explicitly
            const populatedReceipt = await Receipt.findById(receipt._id)
                .populate({
                    path: 'user',
                    model: 'User'
                })
                .exec()
                
            console.log('Receipt found:', populatedReceipt?._id)
            console.log('User populated:', populatedReceipt?.user ? 'Yes' : 'No')
            
            return populatedReceipt
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] getReceiptByPaymentIndex: ${error}`);
            throw error;
        }
    }

    async getUnpaidReceipts() {
        try {
            return await Receipt.find({
                isDeleted: false,
                receiptId: { $exists: true },
                status: "unpaid",
            })
        } catch (error: any) {
            console.error(`ERROR: [receipt.repo] getUnpaidReceipts: ${error}`);
            throw error;
        }
    }
}

export default ReceiptRepository;
