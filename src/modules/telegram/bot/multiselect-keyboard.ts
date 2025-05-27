import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { ParseMode } from 'telegraf/typings/core/types/typegram';

/**
 * Generates an inline keyboard for selecting multiple works
 * @param works Array of work objects
 * @param selected Array of selected work IDs
 * @param language Language code (uz or ru)
 * @param page Current page number
 * @returns Inline keyboard markup
 */
export function generateWorkSelectionKeyboard(
  works: any[],
  selected: string[] = [],
  language: string = 'uz',
  page: number = 1,
  pageSize: number = 10 // Changed to 10 items per page as requested
) {
  console.log(`Generating keyboard with ${works.length} total works, page ${page}, pageSize ${pageSize}`);
  
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPageWorks = works.slice(startIndex, endIndex);
  
  console.log(`Current page works: ${currentPageWorks.length}, from index ${startIndex} to ${endIndex-1}`);
  
  // Create buttons in 2-column layout (2 works per row)
  const workButtons: InlineKeyboardButton[][] = [];
  
  // Process works in pairs to create 2-column layout
  for (let i = 0; i < currentPageWorks.length; i += 2) {
    const work1 = currentPageWorks[i];
    const work2 = i + 1 < currentPageWorks.length ? currentPageWorks[i + 1] : null;
    
    const isSelected1 = selected.includes(work1.id);
    const button1 = {
      text: `${isSelected1 ? '✅ ' : ''}${work1.name}`,
      callback_data: `select_work:${work1.id}`
    };
    
    // If we have a second work in this row
    if (work2) {
      const isSelected2 = selected.includes(work2.id);
      const button2 = {
        text: `${isSelected2 ? '✅ ' : ''}${work2.name}`,
        callback_data: `select_work:${work2.id}`
      };
      
      // Add a row with two buttons
      workButtons.push([button1, button2]);
    } else {
      // Add a row with just one button for the last odd item
      workButtons.push([button1]);
    }
  }
  
  // Add pagination info
  const totalPages = Math.ceil(works.length / pageSize);
  const paginationInfo = [{
    text: `${language === 'uz' ? 'Sahifa' : 'Страница'} ${page}/${totalPages}`,
    callback_data: 'pagination_info' // This doesn't do anything, just a placeholder
  }];
  
  // Navigation buttons
  const navigationButtons: InlineKeyboardButton[] = [];
  
  // Only show prev button if not on first page
  if (page > 1) {
    navigationButtons.push({
      text: language === 'uz' ? '⬅️ Oldingi' : '⬅️ Предыдущий',
      callback_data: `work_page:${page - 1}`
    });
  }
  
  // Only show next button if there are more works
  if (endIndex < works.length) {
    navigationButtons.push({
      text: language === 'uz' ? 'Keyingi ➡️' : 'Следующий ➡️',
      callback_data: `work_page:${page + 1}`
    });
  }
  
  // Confirmation button (only show if at least one item is selected)
  const confirmText = language === 'uz' ? '✅ Tasdiqlash' : '✅ Подтвердить';
  const confirmButton = [{
    text: confirmText,
    callback_data: 'confirm_works'
  }];
  
  // Build the complete keyboard
  const keyboard = [
    ...workButtons,
    // Show pagination info row (page X of Y) if there are multiple pages
    totalPages > 1 ? paginationInfo : [],
    navigationButtons.length > 0 ? navigationButtons : [],
    confirmButton  // Always show confirmation button
  ];
  
  return {
    reply_markup: {
      inline_keyboard: keyboard
    },
    parse_mode: "HTML" as ParseMode
  };
}

/**
 * Creates a message showing works with selected ones indicated
 * @param selectedWorks Array of selected work objects
 * @param language Language code (uz or ru)
 * @returns Formatted message
 */
export function formatSelectedWorksMessage(selectedWorks: any[], language: string = 'uz') {
  // Different title based on whether works have been selected
  let titleText;
  
  if (selectedWorks.length > 0) {
    titleText = language === 'uz' 
      ? '🔍 Siz quyidagi mutaxassisliklarni tanladingiz:'
      : '🔍 Вы выбрали следующие специализации:';
  } else {
    titleText = language === 'uz' 
      ? '🔍 Iltimos, mutaxassisliklarni tanlang:'
      : '🔍 Пожалуйста, выберите специализации:';
  }
  
  // Works list if any works are selected
  let worksList = '';
  if (selectedWorks.length > 0) {
    worksList = selectedWorks.map((work, index) => `${index + 1}. ✅ ${work.name}`).join('\n');
    worksList = `\n${worksList}`;
  }
  
  // Instruction text - always shown
  const instructionText = language === 'uz'
    ? '\nSiz bir nechta mutaxassislikni tanlashingiz mumkin.'
    : '\nВы можете выбрать несколько специализаций.';
  
  // Confirmation text - always shown
  const confirmText = language === 'uz'
    ? '\nTanlashni yakunlash uchun "✅ Tasdiqlash" tugmasini bosing.'
    : '\nНажмите "✅ Подтвердить", чтобы завершить выбор.';
  
  return `${titleText}${worksList}${instructionText}${confirmText}`;
}
