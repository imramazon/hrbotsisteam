import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { ParseMode } from 'telegraf/typings/core/types/typegram';

/**
 * Definition of opportunity options
 */
export interface Opportunity {
  id: string;
  nameRu: string;
  nameUz: string;
}

/**
 * Available opportunities with their translations
 */
export const opportunities: Opportunity[] = [
  { id: 'lunch', nameRu: 'Обед', nameUz: 'Tushlik' },
  { id: 'career', nameRu: 'Карьерный рост', nameUz: 'Karyera o\'sishi' },
  { id: 'hotel', nameRu: 'Для иногородних условия для проживания с удобствами', nameUz: 'Boshqa shaharliklarga mehmonxona' },
  { id: 'meals', nameRu: '3х разовое питание', nameUz: 'Kuniga 3 mahal ovqat' }
];

/**
 * Generates a keyboard for selecting multiple opportunities
 * 
 * @param selected Array of selected opportunity IDs
 * @param language Language code ('uz' or 'ru')
 * @returns Inline keyboard markup
 */
export function generateOpportunityKeyboard(
  selected: string[] = [],
  language: string = 'uz'
) {
  // Create buttons for each opportunity option
  const opportunityButtons: InlineKeyboardButton[][] = opportunities.map(opp => {
    const isSelected = selected.includes(opp.id);
    const displayName = language === 'uz' ? opp.nameUz : opp.nameRu;
    
    return [{
      text: `${isSelected ? '✅ ' : ''}${displayName}`,
      callback_data: `select_opportunity:${opp.id}`
    }];
  });
  
  // Add confirmation button
  const confirmText = language === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить';
  const confirmButton = [{
    text: confirmText,
    callback_data: 'confirm_opportunities'
  }];
  
  // Build the complete keyboard
  const keyboard = [
    ...opportunityButtons,
    confirmButton
  ];
  
  return {
    reply_markup: {
      inline_keyboard: keyboard
    },
    parse_mode: "HTML" as ParseMode
  };
}

/**
 * Creates a message showing selected opportunities
 * 
 * @param selectedOppIds Array of selected opportunity IDs
 * @param language Language code ('uz' or 'ru')
 * @returns Formatted message
 */
export function formatSelectedOpportunitiesMessage(selectedOppIds: string[], language: string = 'uz') {
  // Get the selected opportunity objects
  const selectedOpportunities = opportunities.filter(opp => selectedOppIds.includes(opp.id));
  
  // Different title based on whether opportunities have been selected
  const titleText = language === 'uz' 
    ? '🔍 Ish bilan ta\'minlash imkoniyatlarni tanlang:'
    : '🔍 Выберите возможности для работников:';
  
  // Opportunities list
  let opportunitiesList = '';
  if (selectedOpportunities.length > 0) {
    const names = selectedOpportunities.map((opp, index) => {
      const name = language === 'uz' ? opp.nameUz : opp.nameRu;
      return `${index + 1}. ✅ ${name}`;
    });
    opportunitiesList = `\n${names.join('\n')}`;
  }
  
  // Instruction text
  const instructionText = language === 'uz'
    ? '\nSiz bir nechta imkoniyatlarni tanlashingiz mumkin.'
    : '\nВы можете выбрать несколько возможностей.';
  
  // Confirmation text
  const confirmText = language === 'uz'
    ? '\nTanlashni yakunlash uchun "✅ Tasdiqlash" tugmasini bosing.'
    : '\nНажмите "✅ Подтвердить", чтобы завершить выбор.';
  
  return `${titleText}${opportunitiesList}${instructionText}${confirmText}`;
}

/**
 * Joins selected opportunities into a string format suitable for storage
 * 
 * @param selectedOppIds Array of selected opportunity IDs
 * @param language Language code ('uz' or 'ru')
 * @returns Comma-separated list of opportunity names
 */
export function formatOpportunitiesForStorage(selectedOppIds: string[], language: string = 'uz'): string {
  if (!selectedOppIds || selectedOppIds.length === 0) {
    return '';
  }
  
  const selectedOpportunities = opportunities.filter(opp => selectedOppIds.includes(opp.id));
  const names = selectedOpportunities.map(opp => language === 'uz' ? opp.nameUz : opp.nameRu);
  
  return names.join(', ');
}
