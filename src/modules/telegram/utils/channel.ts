import { Context, Telegraf } from "telegraf";
import { configurations } from "../../../config/index";
import { subscription_keyboard } from "../bot/keyboards";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { ParseMode } from "telegraf/typings/core/types/typegram";

/**
 * Отправляет сообщение с клавиатурой и автоматически отслеживает его для будущего удаления
 * @param ctx Контекст Telegram
 * @param chatId ID чата
 * @param text Текст сообщения
 * @param extra Дополнительные параметры (клавиатура, парсинг и т.д.)
 * @returns Отправленное сообщение
 */
export const sendKeyboardMessage = async (
  ctx: Context, 
  chatId: number | string, 
  text: string, 
  extra: ExtraReplyMessage
) => {
  try {
    // Отправляем сообщение
    const sentMessage = await ctx.telegram.sendMessage(chatId, text, extra);
    
    // Если сообщение отправлено с клавиатурой, отслеживаем его
    if (extra.reply_markup) {
      trackKeyboardMessage(chatId, sentMessage.message_id);
    }
    
    return sentMessage;
  } catch (error) {
    console.error('Error sending keyboard message:', error instanceof Error ? error.message : error);
    throw error;
  }
};

/**
 * Изменяет текст сообщения с inline-клавиатурой
 * @param ctx Контекст Telegram
 * @param chatId ID чата
 * @param messageId ID сообщения
 * @param text Новый текст
 * @param extra Дополнительные параметры (parse_mode, inline_keyboard и т.д.)
 * @returns Обновленное сообщение
 */
export const editKeyboardMessage = async (
  ctx: Context, 
  chatId: number | string, 
  messageId: number,
  text: string, 
  extra: { parse_mode?: ParseMode, reply_markup?: { inline_keyboard: any[][] } }
) => {
  try {
    // Обновляем сообщение
    const editedMessage = await ctx.telegram.editMessageText(chatId, messageId, undefined, text, extra);
    
    // Если сообщение отправлено с клавиатурой, отслеживаем его
    if (extra.reply_markup) {
      trackKeyboardMessage(chatId, messageId);
    }
    
    return editedMessage;
  } catch (error) {
    console.error('Error editing keyboard message:', error instanceof Error ? error.message : error);
    throw error;
  }
};

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
// Хранилище ID сообщений с клавиатурами по чатам
const keyboardMessageIds: Record<string, number[]> = {};

// Функция для отслеживания сообщений с клавиатурой
export const trackKeyboardMessage = (chatId: number | string, messageId: number): void => {
  const chatKey = String(chatId);
  if (!keyboardMessageIds[chatKey]) {
    keyboardMessageIds[chatKey] = [];
  }
  keyboardMessageIds[chatKey].push(messageId);
  
  // Ограничиваем количество хранимых ID для предотвращения утечки памяти
  if (keyboardMessageIds[chatKey].length > 100) {
    keyboardMessageIds[chatKey] = keyboardMessageIds[chatKey].slice(-100);
  }
};

// Функция для удаления только сообщений с клавиатурами или всех сообщений
export const deleteAllPreviousMessages = async (
  ctx: Context, 
  chatId: number | string, 
  fromMessageId?: number,
  onlyKeyboardMessages: boolean = true
): Promise<void> => {
  try {
    const limit = 40;
    const chatKey = String(chatId);
    
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
    
    // При отправке нового сообщения с клавиатурой, отслеживаем его ID
    // Проверяем сообщение в callback query
    if (ctx.callbackQuery && 'message' in ctx.callbackQuery && ctx.callbackQuery.message) {
      const message = ctx.callbackQuery.message;
      if ('reply_markup' in message && message.reply_markup) {
        trackKeyboardMessage(chatId, message.message_id);
      }
    }
    
    // Проверяем обычное сообщение
    if (ctx.message && 'reply_markup' in ctx.message && ctx.message.reply_markup) {
      trackKeyboardMessage(chatId, ctx.message.message_id);
    }
    
    if (onlyKeyboardMessages) {
      // Удаляем только сообщения с клавиатурами, которые мы отслеживали
      const keyboardMessages = keyboardMessageIds[chatKey] || [];
      
      for (const msgId of keyboardMessages) {
        if (fromMessageId !== undefined && msgId < fromMessageId) { // Удаляем только предыдущие сообщения
          try {
            await ctx.telegram.deleteMessage(chatId, msgId);
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (deleteError) {
            // Ignore errors for messages that can't be deleted
          }
        }
      }
      
      // Очищаем список удаленных сообщений
      if (fromMessageId !== undefined) {
        const msgIdToKeep = fromMessageId as number;
        keyboardMessageIds[chatKey] = keyboardMessageIds[chatKey]?.filter(msgId => msgId >= msgIdToKeep) || [];
      }
    } else if (fromMessageId !== undefined) {
      // Стандартное поведение - удалить все сообщения
      const messageId = fromMessageId as number; // Explicit type assertion to ensure TypeScript knows it's a number
      for (let i = messageId - 1; i > messageId - limit; i--) {
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
    }
    
    console.log(`Attempted to clean up previous messages in chat ${chatId}`);
  } catch (error) {
    console.error('Error deleting previous messages:', error instanceof Error ? error.message : error);
  }
};
