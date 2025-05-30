/**
 * Validates a birth date string in DD.MM.YYYY format
 * @param birthDate - The birth date string to validate
 * @returns Object with isValid boolean and optional error message
 */
/**
 * Validates a passport serial number in the format of 2 letters followed by 7 numbers
 * @param passportNumber - The passport number to validate
 * @returns Object with isValid boolean and optional error message in Uzbek
 */
export const validatePassportNumber = (passportNumber: string): { isValid: boolean; errorMessage?: string } => {
  // Check the format (2 letters followed by 7 numbers)
  const passportRegex = /^[A-Za-z]{2}\d{7}$/;
  
  if (!passportRegex.test(passportNumber)) {
    return { 
      isValid: false, 
      errorMessage: 'Passport raqami noto\'g\'ri formatda. Passport raqami 2 ta harf va 7 ta raqamdan iborat bo\'lishi kerak (masalan: AB1234567).' 
    };
  }
  
  return { isValid: true };
};

/**
 * Validates a birth date string in DD.MM.YYYY format
 * @param birthDate - The birth date string to validate
 * @returns Object with isValid boolean and optional error message
 */
export const validateBirthDate = (birthDate: string): { isValid: boolean; errorMessage?: string } => {
  // Check the format (DD.MM.YYYY)
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = birthDate.match(dateRegex);
  
  if (!match) {
    return { 
      isValid: false, 
      errorMessage: 'Sana formati noto\'g\'ri. Iltimos DD.MM.YYYY (masalan: 15.06.1990) formatida kiriting.' 
    };
  }
  
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  
  // Validate day (1-31)
  if (day < 1 || day > 31) {
    return { 
      isValid: false, 
      errorMessage: 'Kun 1 dan 31 gacha bo\'lishi kerak.' 
    };
  }
  
  // Validate month (1-12)
  if (month < 1 || month > 12) {
    return { 
      isValid: false, 
      errorMessage: 'Oy 1 dan 12 gacha bo\'lishi kerak.' 
    };
  }
  
  // Validate year (1950-2100)
  if (year < 1950 || year > 2100) {
    return { 
      isValid: false, 
      errorMessage: 'Yil 1950 dan 2100 gacha bo\'lishi kerak.' 
    };
  }
  
  // Additional validation for days in month
  const daysInMonth = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Check for leap year
  if (month === 2 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    daysInMonth[2] = 29;
  }
  
  if (day > daysInMonth[month]) {
    return {
      isValid: false,
      errorMessage: `${month}-oy uchun kun ${daysInMonth[month]} dan oshmasligi kerak.`
    };
  }
  
  return { isValid: true };
};
