import { config as dotenv } from "dotenv";

dotenv();

export const configurations = {
    port: process.env.APP_PORT || "",
    host: process.env.APP_HOST || "",
    name: process.env.NODE_ENV || "",   
    mongodb: {
        url: process.env.MONGODB_URL || ""
    },
    telegram: {
        token: process.env.TELEGRAM_BOT_TOKEN || "",
        channelId: process.env.TELEGRAM_CHANNEL_ID || "-1002162158560", // Add the channel username with @ or channel ID
        channelLink: process.env.TELEGRAM_CHANNEL_LINK || "https://t.me/asasasasaswwaa" // Add the channel link
    },
    payme: {
        merchantId: process.env.PAYME_MERCHANT_ID || "",
        merchantKey: process.env.PAYME_MERCHANT_KEY || "",
        baseUrl: process.env.PAYME_BASE_URL || "https://api.payme.uz",
    }
}