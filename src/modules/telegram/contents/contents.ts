const contents = {
  selectLanguage: {
    ru: `🇷🇺 Здравствуйте, уважаемый пользователь, выберите удобный для вас язык:`,
    uz: `🇺🇿 Assalomu alaykum hurmatli foydalanuvchi o'zingiz uchun qulay tinli tanlang:`,
  },
  phoneNumber: {
    ru: `Введите свой номер телефона (пример: 998901234567) или нажмите кнопку ☎️ Отправить номер:`,
    uz: `Telefon raqamingizni kiriting (Na'muna: 998901234567) yoki ☎️ Raqam yuborish tugmasini bosing:`,
  },
  registerType: {
    ru: `Как кого вы хотите зарегистрироваться?`,
    uz: `Siz kim sifatida ro'yxatdan o'tmoqchisiz?`,
  },
  fullName: {
    ru: `Введите ваше имя`,
    uz: `To'liq ism sharifingizni kiriting:
Masalan: Bobur Karimov Muzaffar o'g'li`,
  },
  phoneNumberError: {
    ru: `Пожалуйста, введите правильно ваш номер телефона.`,
    uz: `Telefon raqamingizni to'g'ri kiriting.
    Masalan: 998999999999`,
  },
  birthDate: {
    ru: `Введите вашу дату рождения`,
    uz: `Tug'ilgan sanangingizni kiriting:`,
  },
  gender: {
    ru: `Укажите, пожалуйста, ваш пол:`,
    uz: `Jinsingizni belgilang:`,
  },
  residentialAddress: {
    ru: `Укажите ваш регион проживания:`,
    uz: `Yashash hududingizni belgilang:`,
  },
  workingArea: {
    ru: `Укажите области, где вы можете работать:`,
    uz: `Qaysi hududda ishlay olasiz, belgilang:`,
  },
  vacancyRegion: {
    ru: `Укажите регион для вакансии:`,
    uz: `Vakansiya uchun hududni tanlang:`,
  },
  passportSerialNumber: {
    ru: `Введите ваш паспорт серия и номер`,
    uz: `Passport seriyasi va raqami kiriting.`,
  },
  specialization: {
    ru: `Вашу специальность`,
    uz: `Mutaxasisligingizni kiriting.`,
  },

  experience: {
    ru: `Введите ваш опыт`,
    uz: `Tajribangizni kiriting.`,
  },
  additionalSkills: {
    ru: `Напишите о своей дополнительной профессии:`,
    uz: `Qo’shimcha kasb-hunaringiz haqida yozing:`,
  },
  minimumWage: {
    ru: `Какую ежемесячную зарплату вы просите:

Пример: 3 000 000 сумов`,
    uz: `Qancha oylik maosh so’raysiz:

Na’muna: 3000000 so’m`,
  },
  workInACityOtherThanTheResidentialAddress: {
    ru: `Вы можете работать в другом городе?`,
    uz: `Boshqa shaharda ishlashni hohlaysizmi?`,
  },
  isStudent: {
    ru: `Хотите ли вы работать в качестве ученика?`,
    uz: `Shogirt sifatida ishga kirishni xohlaysizmi?`,
  },
  selectStudentWorks: {
    ru: `Выберите интересующие вас работы:`,
    uz: `O'zingizni qiziqtirgan ishlarni tanlang:`,
  },
  menu: {
    ru: `Выберите нужный раздел`,
    uz: `Kerakli bo'limni tanlang`,
  },
  enterpriseName: {
    ru: `Название компании`,
    uz: `Korxona nomi`,
  },
  enterpriseAddress: {
    ru: `Адрес предприятия`,
    uz: `Manzilingizni kiriting.`,
  },
  enterpriseTypeOfActivity: {
    ru: `Вид деятельности`,
    uz: `Faoliyat turi`,
  },
  vacancyType: {
    ru: `Выберите тип вакансии:`,
    uz: `Vakansiya turini tanlang:`,
  },
  vacancySpecialists: {
    ru: `Какие знания необходимы?`,
    uz: `Qanday mutaxasislik kerak?`,
  },
  vacancyArea: {
    ru: `Область`,
    uz: `Hudud`,
  },
  vacancyMinimumExperience: {
    ru: `Минимальный опыт`,
    uz: `Minimal tajriba`,
  },
  vacancyOpportunitiesForWorkers: {
    ru: `Возможности для работников`,
    uz: `Ishchilar uchun imkoniyatlar`,
  },
  vacancySalary: {
    ru: `Зарплата в сумах:

Пример: 3000000`,
    uz: `Ish haqi so'mda:

Misol: 3000000`,
  },
  vote: {
    ru: `Вся ли информация верна?`,
    uz: `Hamma malumotlar to'g'rimi?`,
  },
  settings: {
    ru: `Выберите информацию, которую вы хотите изменить.`,
    uz: `O'zgartirmoqchi bolgan ma'lumotni tanlang`,
  },
  searchWork: {
    ru: `Какую работу вы ищете?`,
    uz: `Qanday ish qidirmoqchisiz?`,
  },
  searchWorkType: {
    ru: `Какой тип работы вы ищете?`,
    uz: `Qanaqa ish turini qidirmoqchisiz?`,
  },
  workTypeJob: {
    ru: `🔍 Поиск работы`,
    uz: `🔍 Ish qidirish`,
  },
  workTypeApprentice: {
    ru: `🎓 Поиск ученика`,
    uz: `🎓 Shogird qidirish`,
  },
  searchWorkerType: {
    ru: `Какого типа работника вы ищете?`,
    uz: `Qanaqa turdagi ishchini qidirmoqchisiz?`,
  },
  workerTypeRegular: {
    ru: `🔍 Поиск работника`,
    uz: `🔍 Ishchi qidirish`,
  },
  workerTypeApprentice: {
    ru: `🎓 Поиск ученика`,
    uz: `🎓 Shogird qidirish`,
  },
  searchWorkerDirections: {
    ru: `В каких направлениях вы ищете? Выберите следующие направления и нажмите кнопку Далее:`,
    uz: `Qaysi yo'nalishlarda qidiryabsiz? Quyidagi yo'nalishlarni tanlang va Keyingi tugmasini bosing:`,
  },
  noVacanciesFound: {
    ru: `Мы свяжемся с вами в ближайшее время.`,
    uz: `Tez orada sizga aloqaga chiqamiz.`,
  },
  vacancyList: {
    ru: `Список вакансий`,
    uz: `Bo'sh ish o'rinlari ro'yxati`,
  },
  position: {
    ru: `Должность`,
    uz: `Lavozim`,
  },
  salary: {
    ru: `Зарплата в сумах:

Пример: 3000000`,
    uz: `Ish haqi so'mda:

Misol: 3000000`,
  },
  currencyUZS: {
    ru: `сум`,
    uz: `so'm`,
  },
  location: {
    ru: `Местоположение`,
    uz: `Joylashuv`,
  },
  page: {
    ru: `Страница`,
    uz: `Sahifa`,
  },
  totalVacancies: {
    ru: `Всего вакансий`,
    uz: `Jami bo'sh ish o'rinlari`,
  },
  selectVacancy: {
    ru: `Выберите вакансию (нажмите на номер)`,
    uz: `Vakansiyani tanlang (raqamni bosing)`,
  },
};

export default contents;
