import { Context, Telegraf } from "telegraf";
import { configurations } from "../../../config/index";
import { subscription_keyboard } from "../bot/keyboards";

/**
 * Checks if a user is subscribed to the channel
 * @param ctx Telegram context
 * @param userId User ID to check
 * @returns Boolean indicating if user is subscribed
 */
export const isSubscribedToChannel = async (ctx: Context, userId: number): Promise<boolean> => {
  try {
    console.log('Channel configuration:', configurations.telegram.channelId);
    
    const channelId = configurations.telegram.channelId;
    
    try {
      const chatInfo = await ctx.telegram.getChat(channelId);
      console.log('Channel info retrieved successfully:', chatInfo.id, chatInfo.type);
    } catch (error) {
      console.log('⚠️ DEVELOPMENT MODE: Bypassing channel check');
      return true;
    }
    
    const chatMember = await ctx.telegram.getChatMember(channelId, userId);
    console.log(`User subscription status: ${chatMember.status}`);
    
    return ["creator", "administrator", "member"].includes(chatMember.status);
  } catch (error) {
    console.error("Error checking channel subscription:", error instanceof Error ? error.message : error);
    
    console.log('⚠️ DEVELOPMENT MODE: Bypassing channel check due to error');
    return true;
  }
};

/**
 * Sends subscription message to user based on their language
 * @param ctx Telegram context
 * @param language User's language code
 */
export const sendSubscriptionMessage = async (ctx: Context, language: string = "en"): Promise<void> => {
  try {
    const lang = language in subscription_keyboard ? language : "en";
    
    const messages = {
      uz: "<b>❗️ Botdan foydalanish uchun kanalimizga obuna bo'ling</b>",
      ru: "<b>❗️ Подпишитесь на наш канал, чтобы использовать бота</b>",
      en: "<b>❗️ Subscribe to our channel to use the bot</b>"
    };
    
    await ctx.reply(messages[lang as keyof typeof messages], {
      ...subscription_keyboard[lang as keyof typeof subscription_keyboard],
      parse_mode: "HTML",
    });
  } catch (error) {
    console.error("Error sending subscription message:", error instanceof Error ? error.message : error);
  }
};

/**
 * Deletes all previous messages from the bot in the chat
 * @param ctx Telegram context
 * @param chatId Chat ID where messages should be deleted
 * @param fromMessageId Optional: Delete messages older than this ID
 */
export const deleteAllPreviousMessages = async (ctx: Context, chatId: number | string, fromMessageId?: number): Promise<void> => {
  try {
    const limit = 40;
    
    if (!fromMessageId) {
      if (ctx.message) {
        fromMessageId = ctx.message.message_id;
      } else if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
        fromMessageId = ctx.callbackQuery.message.message_id;
      }
    }
    
    if (!fromMessageId) {
      console.log('No message ID available to start deletion from');
      return;
    }
    
    for (let i = fromMessageId - 1; i > fromMessageId - limit; i--) {
      if (i <= 0) break;
      
      try {
        await ctx.telegram.deleteMessage(chatId, i);
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (deleteError) {
        if (deleteError instanceof Error && deleteError.message.includes('message to delete not found')) {
          break;
        }
      }
    }
    
    console.log(`Attempted to clean up previous messages in chat ${chatId}`);
  } catch (error) {
    console.error('Error deleting previous messages:', error instanceof Error ? error.message : error);
  }
};
