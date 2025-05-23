import axios from 'axios';

export async function sendTelegramMessage(text: string): Promise<void> {
    const botToken = '6644847691:AAFGH68Xhxp1imRDqRmLOONakHMC_yKa-bM';
    const chatId = '-1002299534056';
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

    try {
        const response = await axios.post(telegramApiUrl, {
            chat_id: chatId,
            text,
        });
        
        if (response.data.ok) {
            console.log('Message sent successfully:', response.data.result);
        } else {
            console.error('Failed to send message:', response.data);
        }
    } catch (error:any) {
        console.error('Error sending message to Telegram:', error);
        throw new Error(`Failed to send message: ${error.message}`);
    }
}
