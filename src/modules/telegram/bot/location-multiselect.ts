import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

interface Location {
  id: string;
  name: string;
  nameRu: string;
}

// All available locations
export const allLocations: Location[] = [
  { id: 'Andijon', name: 'Andijon viloyati', nameRu: 'Андижанская область' },
  { id: 'Buxoro', name: 'Buxoro viloyati', nameRu: 'Бухарская область' },
  { id: 'Farg`ona', name: 'Farg`ona viloyati', nameRu: 'Ферганская область' },
  { id: 'Sirdaryo', name: 'Sirdaryo viloyati', nameRu: 'Сырдарьинская область' },
  { id: 'Jizzax', name: 'Jizzax viloyati', nameRu: 'Джизакская область' },
  { id: 'Namangan', name: 'Namangan viloyati', nameRu: 'Наманганская область' },
  { id: 'Navoiy', name: 'Navoiy viloyati', nameRu: 'Навоийская область' },
  { id: 'Qoraqalpogiston', name: 'Qoraqalpog\'iston Res.', nameRu: 'Каракалпакстан' },
  { id: 'Qashqadaryo', name: 'Qashqadaryo viloyati', nameRu: 'Кашкадарьинская область' },
  { id: 'Samarqand', name: 'Samarqand viloyati', nameRu: 'Самаркандская область' },
  { id: 'Surxondaryo', name: 'Surxondaryo viloyati', nameRu: 'Сурхандарьинская область' },
  { id: 'Toshkent_Viloyati', name: 'Toshkent viloyati', nameRu: 'Ташкентская область' },
  { id: 'Toshkent_Shahri', name: 'Toshkent Shahri', nameRu: 'Город Ташкент' },
  { id: 'Xorazm', name: 'Xorazm viloyati', nameRu: 'Хорезмская область' }
];

/**
 * Generates an inline keyboard for selecting multiple locations
 * @param selected Array of selected location IDs
 * @param language Language code (uz or ru)
 * @returns Inline keyboard markup
 */
export function generateLocationMultiselectKeyboard(
  selected: string[] = [],
  language: string = 'uz'
) {
  // Create buttons in 2-column layout (2 locations per row)
  const locationButtons: InlineKeyboardButton[][] = [];
  
  // Process locations in pairs to create 2-column layout
  for (let i = 0; i < allLocations.length; i += 2) {
    const location1 = allLocations[i];
    const location2 = i + 1 < allLocations.length ? allLocations[i + 1] : null;
    
    const isSelected1 = selected.includes(location1.id);
    const locationName1 = language === 'ru' ? location1.nameRu : location1.name;
    
    const button1 = {
      text: `${isSelected1 ? '✅ ' : ''}${locationName1}`,
      callback_data: `multiselect_location:${location1.id}`
    };
    
    // If we have a second location in this row
    if (location2) {
      const isSelected2 = selected.includes(location2.id);
      const locationName2 = language === 'ru' ? location2.nameRu : location2.name;
      
      const button2 = {
        text: `${isSelected2 ? '✅ ' : ''}${locationName2}`,
        callback_data: `multiselect_location:${location2.id}`
      };
      
      // Add a row with two buttons
      locationButtons.push([button1, button2]);
    } else {
      // Add a row with one button
      locationButtons.push([button1]);
    }
  }
  
  // Add Done button at the bottom
  const doneText = language === 'ru' ? 'Готово' : 'Tayyor';
  locationButtons.push([{ text: doneText, callback_data: 'locations_done' }]);
  
  return {
    reply_markup: {
      inline_keyboard: locationButtons
    },
    parse_mode: 'HTML' as const
  };
}

/**
 * Formats a message showing the selected locations
 * @param selectedLocationIds Array of selected location IDs
 * @param language Language code (uz or ru)
 * @returns Formatted message
 */
export function formatSelectedLocationsMessage(
  selectedLocationIds: string[],
  language: string = 'uz'
): string {
  if (selectedLocationIds.length === 0) {
    return language === 'ru' 
      ? 'Области не выбраны. Пожалуйста, выберите минимум одну область.'
      : 'Hududlar tanlanmagan. Iltimos, kamida bitta hududni tanlang.';
  }
  
  const selectedLocations = allLocations.filter(loc => 
    selectedLocationIds.includes(loc.id)
  );
  
  let title = language === 'ru' 
    ? 'Выбранные области:\n'
    : 'Tanlangan hududlar:\n';
  
  const locationNames = selectedLocations.map(loc => 
    language === 'ru' ? loc.nameRu : loc.name
  );
  
  return title + locationNames.map(name => `• ${name}`).join('\n');
}
