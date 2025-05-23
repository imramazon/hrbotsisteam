import ReceiptRepo from "./repo";
import { TGetReceiptById, TInsertReceipt, TRemoveReceipt, TUpdateReceipt, TGetReceiptsByUser, TGetReceiptByPaymentIndex, TUpdateReceiptStatus } from "./types";
import UserService from "../user/service"
import PaymeCards from '../../integration/payme/cards/service'
import { configurations } from "../../config";
import { sendTelegramMessage } from "../../utils/sendTelegramMessage";

const repo = new ReceiptRepo();

class ReceiptService {
    async insertReceipt(data: TInsertReceipt) {
        try {
            const user = await UserService.getUserById(data.userId)

            if (!user) {
                return null
            }
            data.user = user
            const newReceipt = await repo.insertReceipt(data)

            const merchantId = configurations.payme.merchantId
            const merchantKey = configurations.payme.merchantKey

            const receipt = await PaymeCards.receiptsCreate({
                amount: data.amount * 100,
                order_id: newReceipt.paymentIndex,
                paymeUrl: configurations.payme.baseUrl,
                merchantId,
                merchantKey,
            })
            if (!receipt.status) {
                return null
            }
            await repo.updateReceiptPaymeReceiptId({
                receipt: newReceipt,
                paymeReceiptId: receipt.data.result.receipt._id
            })
        } catch (error: any) {
            console.error(error)
            console.error(`ERROR: [Receipt.service] insertReceipt: ${error}`);
            return null;
        }
    }
    async getReceiptById(data: TGetReceiptById) {
        try {
            const receipt = await repo.getReceiptById(data);

            if (!receipt) {
                return null;
            }

            return receipt;
        } catch (error: any) {
            console.error(`ERROR: [Receipt.service] getReceiptById: ${error}`);
            return null;
        }
    }

    async updateReceipt(data: TUpdateReceipt) {
        try {
            const { receiptId } = data;

            const receipt = await repo.getReceiptById({ receiptId });

            if (!receipt) {
                return null;
            }

            const updateReceipt = await repo.updateReceipt(
                { receipt },
                data
            );
            return updateReceipt
        } catch (error: any) {
            console.error(`ERROR: [Receipt.service] updateReceipt: ${error}`);
            return null;
        }
    }

    async removeReceipt(data: TRemoveReceipt) {
        try {
            const receipt = await repo.getReceiptById({ receiptId: data.receiptId });

            if (!receipt) {
                return null;
            }

            data.receipt = receipt;

            return repo.removeReceipt(data);
        } catch (error: any) {
            console.error(`ERROR: [Receipt.service] removeReceipt: ${error}`);
            return null;
        }
    }

    async getReceiptsByUser(data: TGetReceiptsByUser) {
        try {
            const user = await UserService.getUserById(data.userId)

            if (!user) {
                return null;
            }
            data.user = user
            let receipts = await repo.getReceiptsByUser(data);

            return receipts;
        } catch (error: any) {
            console.log(`ERROR: [receipt.service] getReceiptsByUser: ${error}`);
            return null;
        }
    }
    async getReceiptByPaymentIndex(data: TGetReceiptByPaymentIndex) {
        try {
            const receipt = await repo.getReceiptByPaymentIndex(data)

            return receipt
        } catch (error: any) {
            console.log(`ERROR: [receipt.service] getReceiptByPaymentIndex: ${error}`);
            return error
        }
    }
    async getUnpaidReceipts() {
        try {
            const receipts = await repo.getUnpaidReceipts()

            for (let i = 0; i < receipts.length; i++) {
                const receipt = receipts[i];
                const paymeResult = await PaymeCards.receiptsGet({
                    receiptId: receipt.receiptId,
                    paymeUrl: configurations.payme.baseUrl,
                    merchantId: configurations.payme.merchantId,
                    merchantKey: configurations.payme.merchantKey,
                })

                if (paymeResult && paymeResult.result) {
                    if (
                        paymeResult.result.receipt.state == 4 &&
                        receipt.status != 'paid'
                    ) {
                        const currentDate: Date = new Date()
                        currentDate.setHours(currentDate.getHours() + 5)
                        const time: string = currentDate.toTimeString().split(' ')[0]

                        const date: string = currentDate.toISOString().split('T')[0]

                        const message = `
🧾 ${receipt.user._id.toString()}
👤 ${receipt.user.fullName}
💳 ${paymeResult.result.receipt.card.number}
🇺🇿 ${paymeResult.result.receipt.amount / 100}сум
🕓 ${time} ${date}
✅Успешная оплата`
                        await sendTelegramMessage(message)
                        await repo.updateReceiptStatus({
                            receiptId: receipt.id,
                            receipt: receipt,
                            status: "paid"
                        })
                    }
                }
            }
        } catch (error: any) {
            console.log(`ERROR: [receipt.service] getReceiptByPaymentIndex: ${error}`);
            return error
        }
    }
    async updateReceiptStatus(data: TUpdateReceiptStatus) {
        try {
            const { receiptId } = data;

            const receipt = await repo.getReceiptById({ receiptId });

            if (!receipt) {
                return null;
            }
            data.receipt = receipt
            const updateReceipt = await repo.updateReceiptStatus(data);
            return updateReceipt
        } catch (error: any) {
            console.error(`ERROR: [Receipt.service] updateReceipt: ${error}`);
            return error;
        }
    }
}

export default new ReceiptService();
