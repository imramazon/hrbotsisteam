import { Composer, Context } from "telegraf";
import contents from "../contents/contents";
import { gender_keyboard, worker_menu_keyboard, language_keyboard, vote_keyboard, enterprise_menu_keyboard, vacancy_pagination_keyboard, back_to_menu_keyboard, location_keyboard } from "./keyboards";
import { generateWorkSelectionKeyboard, formatSelectedWorksMessage } from "./multiselect-keyboard";
import { validateBirthDate } from "../utils/validation";
import ExcelJS from 'exceljs';
import { Readable } from 'stream';
import UsersService from "../../../modules/user/service";
import { deleteAllPreviousMessages, isSubscribedToChannel, sendSubscriptionMessage } from "../utils/channel";
import WorkerService from "../../../modules/worker/service";
import EnterpriseService from "../../../modules/enterprise/service";
import VacancyService from "../../../modules/vacancy/service";
import WorkService from "../../../modules/work/service";
import ReceiptService from "../../../modules/receipt/service";
import { getPriceByWorkerCount } from "../../../utils/getPriceByWorkerCount";
import { writeEnterpriseToSheet } from "../../../utils/googleSheet";
import { allLocations } from "./location-multiselect";
const bot = new Composer();

bot.command("start", async (ctx: Context) => {
  const chatId: any = ctx.chat?.id;
  const userId = ctx.from?.id;

  if (!userId) {
    console.error("User ID not found in context");
    return;
  }

  try {
    const isSubscribed = await isSubscribedToChannel(ctx, userId);

    if (!isSubscribed) {
      await sendSubscriptionMessage(ctx, ctx.from?.language_code);
      return;
    }

    let user: any = await UsersService.getUserByChatId(chatId);

    if (!user) {
      const newUser: any = ctx.from;
      const data = {
        chatId: chatId,
        fullName: `${newUser.first_name}`,
        username: newUser.username,
        telegramLanguage: newUser.language_code,
      };
      user = await UsersService.create(data);
    }

    if (user && (user.telegramStep === 14 || user.telegramStep === 6)) {
      if (user.type === "enterprise") {
        return await ctx.reply(contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user.type === "worker") {
        return await ctx.reply(contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
    }

    // Delete previous messages before sending a new one
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.selectLanguage[user.telegramLanguage as keyof typeof contents.selectLanguage] ||
      contents.selectLanguage.uz,
      {
        ...language_keyboard,
        parse_mode: "HTML",
      }
    );
  } catch (error) {
    console.error("Error handling /start command:", error instanceof Error ? error.message : error);
  }
});

bot.on("text", async (ctx: Context) => {
  const message = ctx.message;
  const chatId: any = ctx.chat?.id;
  const userId = ctx.from?.id;

  if (!userId) {
    console.error("User ID not found in context");
    return;
  }

  const isSubscribed = await isSubscribedToChannel(ctx, userId);

  if (!isSubscribed) {
    await deleteAllPreviousMessages(ctx, chatId);
    await sendSubscriptionMessage(ctx, ctx.from?.language_code);
    return;
  }

  let user: any = await UsersService.getUserByChatId(chatId);
  const phone_regex = /998[0-9]{9}/;
  if (message && "text" in message) {
    const text = message.text;
    const messageId = message.message_id;

    try {
      // Return menu if user is worker with telegramStep 14 or enterprise with telegramStep 6
      if (user) {
        if ((user.type === "worker" && user.telegramStep === 14) ||
          (user.type === "enterprise" && user.telegramStep === 6)) {
          if (user.type === "enterprise") {
            return await ctx.reply(contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
              contents.menu.uz,
              {
                ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
                parse_mode: "HTML",
              });
          }
          if (user.type === "worker") {
            return await ctx.reply(contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
              contents.menu.uz,
              {
                ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
                parse_mode: "HTML",
              });
          }
        }
      }
      const newUser: any = ctx.from;

      const data = {
        chatId: chatId,
        fullName: `${newUser.first_name}`,
        username: newUser.username,
        telegramLanguage: newUser.language_code,
      };
      user = await UsersService.create(data);
      if (user && user.telegramStep === 0) {
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.selectLanguage[user.telegramLanguage as keyof typeof contents.selectLanguage] ||
          contents.selectLanguage.uz,
          {
            ...language_keyboard,
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 2) {
        if (phone_regex.test(text)) {
          await UsersService.update(chatId, { phoneNumber: text, telegramStep: 3 });

          await deleteAllPreviousMessages(ctx, chatId);
          if (user.type === "enterprise") {
            await ctx.reply(
              contents.enterpriseName[user.telegramLanguage as keyof typeof contents.enterpriseName] ||
              contents.enterpriseName.uz,
              {
                parse_mode: "HTML",
              }
            );
          }
          if (user.type === "worker") {

            await ctx.reply(
              contents.fullName[user.telegramLanguage as keyof typeof contents.fullName] ||
              contents.fullName.uz,
              {
                parse_mode: "HTML",
              }
            );
          }
        } else {
          await deleteAllPreviousMessages(ctx, chatId);
          await ctx.reply(contents.phoneNumberError[user.telegramLanguage as keyof typeof contents.phoneNumberError] ||
            contents.phoneNumberError.uz,
            {
              parse_mode: "HTML",
            });
        }
      }
      // WORKER REGISTER --------------------------------
      if (user && user.telegramStep === 3 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 4 });
        await WorkerService.update(user.id, { fullName: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.birthDate[user.telegramLanguage as keyof typeof contents.birthDate] ||
          contents.birthDate.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 4 && user.type === "worker") {
        // Validate birth date
        const validation = validateBirthDate(text);

        if (!validation.isValid) {
          // If validation fails, send error message and keep the same telegramStep
          await ctx.reply(validation.errorMessage || 'Sana formati noto\'g\'ri', {
            parse_mode: "HTML",
          });

          // Send the birth date prompt again
          await ctx.reply(
            contents.birthDate[user.telegramLanguage as keyof typeof contents.birthDate] ||
            contents.birthDate.uz,
            {
              parse_mode: "HTML",
            }
          );
          return;
        }

        // If validation passes, update and continue
        await UsersService.update(chatId, { telegramStep: 5 });
        await WorkerService.update(user.id, { birthDate: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.gender[user.telegramLanguage as keyof typeof contents.gender] ||
          contents.gender.uz,
          {
            ...gender_keyboard[user?.telegramLanguage as keyof typeof gender_keyboard],
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 6 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 7 });
        await WorkerService.update(user.id, { residentialAddress: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.workingArea[user.telegramLanguage as keyof typeof contents.workingArea] ||
          contents.workingArea.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 7 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 8 });
        await WorkerService.update(user.id, { workingArea: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.passportSerialNumber[user.telegramLanguage as keyof typeof contents.passportSerialNumber] ||
          contents.passportSerialNumber.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 8 && user.type === "worker") {
        await WorkerService.update(user.id, { passportSerialNumber: text });
        await deleteAllPreviousMessages(ctx, chatId);

        try {
          // Fetch available works from the database
          const works = await WorkService.getAll();

          if (!works || works.length === 0) {
            // If no works found, proceed with text input
            await UsersService.update(chatId, { telegramStep: 9 });
            await ctx.reply(
              contents.specialization[user.telegramLanguage as keyof typeof contents.specialization] ||
              contents.specialization.uz,
              {
                parse_mode: "HTML",
              }
            );
          } else {
            // Store works in user session
            await UsersService.update(chatId, {
              worksList: JSON.stringify(works),
              selectedWorks: '[]',
              worksPage: 1
            });

            // Get language for messages
            const language = user.telegramLanguage || 'uz';

            // Create initial message explaining the selection
            const initialMessage = language === 'uz'
              ? '🔍 Quyidagi mutaxasisliklardan birini yoki bir nechtasini tanlang:'
              : '🔍 Выберите одну или несколько специализаций из списка:';

            // Send selection keyboard
            await ctx.reply(initialMessage,
              generateWorkSelectionKeyboard(works, [], language, 1)
            );
          }
        } catch (error) {
          console.error('Error fetching works:', error);
          // Fallback to text input
          await UsersService.update(chatId, { telegramStep: 9 });
          await ctx.reply(
            contents.specialization[user.telegramLanguage as keyof typeof contents.specialization] ||
            contents.specialization.uz,
            {
              parse_mode: "HTML",
            }
          );
        }
      }
      if (user && user.telegramStep === 10 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 11 });
        await WorkerService.update(user.id, { profession: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.experience[user.telegramLanguage as keyof typeof contents.experience] ||
          contents.experience.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 11 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 12 });
        await WorkerService.update(user.id, { experience: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.additionalSkills[user.telegramLanguage as keyof typeof contents.additionalSkills] ||
          contents.additionalSkills.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 12 && user.type === "worker") {
        // After additional skills, ask for minimum wage first
        await UsersService.update(chatId, { telegramStep: 13 });
        await WorkerService.update(user.id, { additionalSkills: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.minimumWage[user.telegramLanguage as keyof typeof contents.minimumWage] ||
          contents.minimumWage.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 13 && user.type === "worker") {
        // Save minimum wage and ask if they want to be an apprentice
        await UsersService.update(chatId, { telegramStep: 25 }); // Using step 25 for apprentice question
        await WorkerService.update(user.id, { minimumWage: text });
        await deleteAllPreviousMessages(ctx, chatId);

        // Ask if they want to be an apprentice
        await ctx.reply(
          contents.isStudent[user.telegramLanguage as keyof typeof contents.isStudent] ||
          contents.isStudent.uz,
          {
            ...vote_keyboard[user?.telegramLanguage as keyof typeof vote_keyboard],
            parse_mode: "HTML",
          }
        );
      }
      // WORKER REGISTER END ---------------------------

      // ENTERPRISE REGISTER ---------------------------
      if (user && user.telegramStep === 3 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 4 });
        await EnterpriseService.update(user.id, { name: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.enterpriseTypeOfActivity[user.telegramLanguage as keyof typeof contents.enterpriseTypeOfActivity] ||
          contents.enterpriseTypeOfActivity.uz,
          {
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 4 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 5 });
        await EnterpriseService.update(user.id, { typeOfActivity: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.enterpriseAddress[user.telegramLanguage as keyof typeof contents.enterpriseAddress] ||
          contents.enterpriseAddress.uz,
          {
            ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 5 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 6 });
        await EnterpriseService.update(user.id, { address: text });
        await deleteAllPreviousMessages(ctx, chatId);
        const successMsg = user.telegramLanguage === "ru" ?
          "✅ Регистрация успешно завершена! Выберите нужный раздел:" :
          "✅ Registratsiyadan muvaffaqiyatli o'tdingiz! Kerakli bo'limni tanlang:";

        const enterprise: any = await EnterpriseService.getByUserId(user.id);
        const googleSheetData = {
          companyName: enterprise.name,
          typeOfActivity: enterprise.typeOfActivity,
          address: enterprise.address,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          _id: enterprise._id,
          createdAt: enterprise.createdAt,
        }

        await writeEnterpriseToSheet([googleSheetData]);

        await ctx.reply(
          successMsg,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      // ENTERPRISE REGISTER END ---------------------------

      // VACANCY ---------------------------
      if (user && user.telegramStep === 7 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 8 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        console.log(`Enterprise:`, enterprise);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        console.log(`Vacancy:`, vacancy);
        await VacancyService.update(vacancy?.id, { specialists: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.vacancyArea[user.telegramLanguage as keyof typeof contents.vacancyArea] ||
          contents.vacancyArea.uz,
          {
            parse_mode: "HTML",
          });
      }
      // if (user && user.telegramStep === 8 && user.type === "enterprise") {
      //   await UsersService.update(chatId, { telegramStep: 9 });
      //   const enterprise = await EnterpriseService.getByUserId(user.id);
      //   const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
      //   await VacancyService.update(vacancy?.id, { area: text });
      //   await deleteAllPreviousMessages(ctx, chatId);
      //   await ctx.reply(
      //     contents.vacancyMinimumExperience[user.telegramLanguage as keyof typeof contents.vacancyMinimumExperience] ||
      //     contents.vacancyMinimumExperience.uz,
      //     {
      //       parse_mode: "HTML",
      //     });
      // }
      if (user && user.telegramStep === 9 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 10 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await VacancyService.update(vacancy?.id, { minimumExperience: text });
        await deleteAllPreviousMessages(ctx, chatId);
        
        // Set the current vacancy ID for the opportunity selection process
        if (vacancy) {
          await UsersService.update(chatId, { currentVacancyId: vacancy.id });
        }
        
        // Import the opportunity multi-select helpers
        const { generateOpportunityKeyboard, formatSelectedOpportunitiesMessage } = require('./opportunity-multiselect');
        
        // Initialize selected opportunities if not already present
        const selectedOpportunities = user.selectedOpportunities || [];
        
        // Show introduction message about opportunities
        await ctx.reply(
          contents.vacancyOpportunitiesForWorkers[user.telegramLanguage as keyof typeof contents.vacancyOpportunitiesForWorkers] ||
          contents.vacancyOpportunitiesForWorkers.uz,
          { parse_mode: "HTML" }
        );
        
        // Show the multi-select interface
        const message = formatSelectedOpportunitiesMessage(selectedOpportunities, user.telegramLanguage);
        await ctx.reply(message, generateOpportunityKeyboard(selectedOpportunities, user.telegramLanguage));
      }
      // Step 10 for enterprises is now handled via the opportunity multi-select in callback-query.ts
      // When user confirms their selections, they are automatically moved to step 11
      if (user && user.telegramStep === 11 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 12 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        let vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await VacancyService.update(vacancy?.id, { salary: text });
        vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await deleteAllPreviousMessages(ctx, chatId);
        if (user.telegramLanguage === "uz") {
          const locationObj = allLocations.find(loc => loc.id === vacancy?.area);
          const translatedArea = locationObj ? locationObj.name : vacancy?.area;
          
          const vacancyText = `
👨‍💼 Bosh ish o'rni: ${vacancy?.specialist}
📍 Ishlash joyi: ${translatedArea}
📘 Minimal tajriba: ${vacancy?.minimumExperience} 
💰 Oylik boshlang'ich: ${vacancy?.salary} so'm
ℹ️ Qo'shimcha ma'lumotlar: ${vacancy?.opportunitiesForWorkers}

👤 Mas'ul shaxs: ${user?.fullName}
📱 Murojaat qilish uchun telegram: ${user.username}
☎️ Murojaat qilish uchun telefon: ${user.phoneNumber}

✅ Hamma malumotlar to'g'rimi?
        `
          await ctx.reply(vacancyText, {
            ...vote_keyboard[user?.telegramLanguage as keyof typeof vote_keyboard],
            parse_mode: "HTML",
          });
        }
        if (user.telegramLanguage === "ru") {
          // Find the location in allLocations or use the original value
          const locationObj = allLocations.find(loc => loc.id === vacancy?.area);
          const translatedArea = locationObj ? locationObj.nameRu : vacancy?.area;
          
          const vacancyText = `
👨‍💼 Вакансия на должность: ${vacancy?.specialist}
📘 Минимальный опыт: ${vacancy?.minimumExperience}
📍 Место работы: ${translatedArea}
👤 Менеджер: ${user?.fullName}
💰 Начальная зарплата: ${vacancy?.salary} сумов
ℹ️ Дополнительная информация: ${vacancy?.opportunitiesForWorkers}

📱 Телеграмма для заявки: ${user.username}
☎️ Телефон для заявки: ${user.phoneNumber}

✅ Все данные верны?
        `
          await ctx.reply(vacancyText, {
            ...vote_keyboard[user?.telegramLanguage as keyof typeof vote_keyboard],
            parse_mode: "HTML",
          });
        }
      }
      // VACANCY END ---------------------------

      // ENTERPRISE EDIT INFO ---------------------------
      if (user && user.telegramStep === 15 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 6 });
        await EnterpriseService.update(user?.id, { name: text });

        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 16 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 6 });
        await EnterpriseService.update(user.id, { address: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 17 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 6 });
        await EnterpriseService.update(user.id, { typeOfActivity: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      // ENTERPRISE EDIT INFO END ---------------------------

      // WORKER EDIT INFO ---------------------------
      if (user && user.telegramStep === 15 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user?.id, { fullName: text });

        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 16 && user.type === "worker") {
        // Validate birth date
        const validation = validateBirthDate(text);

        if (!validation.isValid) {
          // If validation fails, send error message and keep the same telegramStep
          await ctx.reply(validation.errorMessage || 'Sana formati noto\'g\'ri', {
            parse_mode: "HTML",
          });

          return;
        }

        // If validation passes, update and continue
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { birthDate: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 18 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { residentialAddress: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 19 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { workingArea: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 20 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { passportSerialNumber: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 21 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { specialization: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 22 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { profession: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 23 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { experience: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 24 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { additionalSkills: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 25 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { minimumWage: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user?.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          }
        );
      }
      // WORKER EDIT INFO END ---------------------------

      // WORKER SEARCH WORK ---------------------------
      // Handle enterprise worker search specialization input
      if (user && user.telegramStep === 31 && user.type === "enterprise") {
        const specialization = text;
        // Store the specialization for reference
        await UsersService.update(chatId, { workerSpecialization: specialization });

        try {
          // Check for saved receipt ID from check_payment process
          let validReceipt;

          if (user.selectedReceiptId) {
            // Get receipt directly by the saved ID (more efficient)
            console.log(`Using saved receipt ID: ${user.selectedReceiptId}`);
            validReceipt = await ReceiptService.getReceiptById({ receiptId: user.selectedReceiptId });
          } else {
            // Fallback: Check if the enterprise has a valid paid receipt
            console.log(`No saved receipt ID found, searching for valid receipts`);
            const receipts = await ReceiptService.getReceiptsByUser({
              userId: user.id,
              user: user
            });

            // Find a valid receipt for worker search
            validReceipt = receipts && receipts.find((receipt: any) =>
              receipt.status === 'paid' && receipt.purpose === 'worker_search' && !receipt.isUsed
            );
          }

          if (!validReceipt || validReceipt.status !== 'paid') {
            // No valid receipt found or receipt not paid, redirect to payment flow
            await UsersService.update(chatId, { telegramStep: 40 }); // Step for payment flow

            // Send payment required message
            await ctx.reply(
              user.telegramLanguage === "ru" ?
                "Для поиска работников необходимо оплатить услугу. Пожалуйста, вернитесь в меню и выберите 'Поиск работников'." :
                "Ishchilarni qidirish uchun xizmat uchun to'lov qilishingiz kerak. Iltimos, menyuga qayting va 'Ishchilarni qidirish' tugmasini bosing.",
              {
                ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
                parse_mode: "HTML",
              }
            );
            return;
          }

          // Find workers with the specified specialization
          const allWorkers = await WorkerService.findBySpecialization(specialization);

          if (allWorkers.length === 0) {
            await ctx.reply(
              user.telegramLanguage === "ru" ?
                `К сожалению, работники с указанной специальностью не найдены. Попробуйте другую специальность.` :
                `Afsuski, ko'rsatilgan mutaxassislikdagi ishchilar topilmadi. Boshqa mutaxassislikni sinab ko'ring.`,
              {
                ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
                parse_mode: "HTML",
              }
            );
            return;
          }

          // Get the worker count from the receipt or user data
          const workerCount = (validReceipt && validReceipt.workerCount) || user.workerCount || 10;

          // Limit the number of workers based on the paid amount
          const workers = allWorkers.slice(0, workerCount);

          // Generate Excel file with worker data
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('Workers');

          // Add headers
          worksheet.columns = [
            { header: user.telegramLanguage === "ru" ? 'Полное имя' : 'To\'liq ismi', key: 'fullName', width: 20 },
            { header: user.telegramLanguage === "ru" ? 'Пол' : 'Jinsi', key: 'gender', width: 10 },
            { header: user.telegramLanguage === "ru" ? 'Телефон' : 'Telefon', key: 'phone', width: 15 },
            { header: user.telegramLanguage === "ru" ? 'Адрес проживания' : 'Yashash manzili', key: 'residentialAddress', width: 25 },
            { header: user.telegramLanguage === "ru" ? 'Рабочая зона' : 'Ishlash hududi', key: 'workingArea', width: 20 },
            { header: user.telegramLanguage === "ru" ? 'Специализация' : 'Mutaxassislik', key: 'specialization', width: 30 },
            { header: user.telegramLanguage === "ru" ? 'Профессия' : 'Kasbi', key: 'profession', width: 20 },
            { header: user.telegramLanguage === "ru" ? 'Опыт' : 'Tajriba', key: 'experience', width: 15 },
            { header: user.telegramLanguage === "ru" ? 'Дополнительные навыки' : 'Qo\'shimcha ko\'nikmalar', key: 'additionalSkills', width: 30 },
            { header: user.telegramLanguage === "ru" ? 'Минимальная зарплата' : 'Minimal ish haqi', key: 'minimumWage', width: 15 },
          ];

          // Add rows for each worker
          workers.forEach(worker => {
            worksheet.addRow({
              fullName: worker.fullName || '-',
              gender: worker.gender === 'male' ?
                (user.telegramLanguage === "ru" ? 'Мужской' : 'Erkak') :
                (user.telegramLanguage === "ru" ? 'Женский' : 'Ayol'),
              phone: worker.user?.phoneNumber || '-',
              residentialAddress: worker.residentialAddress || '-',
              workingArea: worker.workingArea || '-',
              specialization: Array.isArray(worker.specialization) ? worker.specialization.join(', ') : worker.specialization || '-',
              profession: worker.profession || '-',
              experience: worker.experience || '-',
              additionalSkills: Array.isArray(worker.additionalSkills) ? worker.additionalSkills.join(', ') : worker.additionalSkills || '-',
              minimumWage: worker.minimumWage ? `${worker.minimumWage} ${user.telegramLanguage === "ru" ? 'сум' : 'so\'m'}` : '-',
            });
          });

          // Generate buffer from workbook
          const buffer = await workbook.xlsx.writeBuffer();
          const readable = new Readable();
          readable.push(buffer);
          readable.push(null);

          // Send file to user
          await ctx.replyWithDocument({
            source: readable,
            filename: `${specialization}_workers.xlsx`
          }, {
            caption: user.telegramLanguage === "ru" ?
              `Найдено ${workers.length} работников по специальности "${specialization}".` :
              `"${specialization}" mutaxassisligi bo'yicha ${workers.length} ta ishchi topildi.`
          });

          // Mark the receipt as used after successful worker search
          if (validReceipt) {
            // Update receipt to mark it as used
            await ReceiptService.updateReceipt({
              receiptId: validReceipt.id,
              receipt: validReceipt,
              amount: validReceipt.amount,
              method: validReceipt.method as string,
              platform: validReceipt.platform as string,
              isUsed: true
            });

            console.log(`Marked receipt ${validReceipt.id} as used after worker search for user ${user.id}`);

            // Clear the saved receipt ID after using it
            await UsersService.update(chatId, { selectedReceiptId: null });
          }

          // Directly show the enterprise menu after sending Excel file
          await ctx.reply(
            contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
            contents.menu.uz,
            {
              ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
              parse_mode: "HTML",
            }
          );

          // Update user step back to menu state
          await UsersService.update(chatId, { telegramStep: 14 });

        } catch (error) {
          console.error(`Error processing worker search for user ${chatId}:`, error);

          // Notify the user of the error
          await ctx.reply(
            user.telegramLanguage === "ru" ?
              "Произошла ошибка при поиске работников. Пожалуйста, попробуйте позже." :
              "Ishchilarni qidirishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
            {
              ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
              parse_mode: "HTML",
            }
          );

          // Even in case of error, update user step back to menu state
          await UsersService.update(chatId, { telegramStep: 14 });
        }
      }

      // Handle manual worker count input for enterprise users (after selecting work directions)
      // else if (user && user.telegramStep === 30 && user.type === "enterprise") {
      //   // Validate input is a number
      //   const workerCount = parseInt(text);

      //   if (isNaN(workerCount) || workerCount <= 0) {
      //     await ctx.reply(
      //       user.telegramLanguage === "ru" ?
      //         "Пожалуйста, введите положительное число." :
      //         "Iltimos, musbat son kiriting."
      //     );
      //     return;
      //   }

      //   try {
      //     // Get the selected work directions
      //     const selectedWorksString = user.selectedWorks || '[]';
      //     let selectedWorkIds = [];
      //     try {
      //       selectedWorkIds = JSON.parse(selectedWorksString);
      //     } catch (error) {
      //       console.error('Error parsing selectedWorks:', error);
      //     }

      //     // Check how many workers match the selected work directions
      //     let matchingWorkers = [];

      //     // Determine which type of workers to search for
      //     const workerType = user.workerSearchType || 'regular'; // Default to regular workers if not specified
      //     console.log(`Searching for worker type: ${workerType}`);

      //     if (selectedWorkIds.length > 0) {
      //       // Get workers that match the selected work directions and worker type
      //       matchingWorkers = await WorkerService.getWorkersBySpecializations(selectedWorkIds, workerType);
      //       console.log(`Found ${matchingWorkers.length} workers matching the selected specializations and type ${workerType}`);
      //     } else {
      //       // If no work directions were selected, get all workers of specified type
      //       // Since we need to filter by worker type, we'll use the specialized method with an empty array
      //       matchingWorkers = await WorkerService.getWorkersBySpecializations([], workerType);
      //       console.log(`No specializations selected, found ${matchingWorkers.length} total ${workerType} workers`);
      //     }

      //     const availableWorkerCount = matchingWorkers.length;

      //     // If there are fewer available workers than requested
      //     if (availableWorkerCount < workerCount) {
      //       // Create a different message and button setup depending on whether there are any workers at all
      //       if (availableWorkerCount === 0) {
      //         // No workers available - show message with only return to menu button
      //         await ctx.reply(
      //           user.telegramLanguage === "ru" ?
      //             `По выбранным направлениям нет доступных работников. Пожалуйста, вернитесь в меню и выберите другие направления.` :
      //             `Tanlangan yo'nalishlar bo'yicha ishchi mavjud emas. Iltimos, menyuga qayting va boshqa yo'nalishlarni tanlang.`,
      //           {
      //             reply_markup: {
      //               inline_keyboard: [
      //                 [
      //                   {
      //                     text: user.telegramLanguage === "ru" ? "🔙 Вернуться в меню" : "🔙 Menyuga qaytish",
      //                     callback_data: "back-to-menu"
      //                   }
      //                 ]
      //               ]
      //             },
      //             parse_mode: "HTML"
      //           }
      //         );
      //       } else {
      //         // Some workers available but fewer than requested - show message with return to menu button
      //         await ctx.reply(
      //           user.telegramLanguage === "ru" ?
      //             `Доступно только ${availableWorkerCount} работников по выбранным направлениям. Пожалуйста, введите число не больше ${availableWorkerCount} или вернитесь в меню.` :
      //             `Tanlangan yo'nalishlar bo'yicha faqat ${availableWorkerCount} ta ishchi mavjud. Iltimos, ${availableWorkerCount} dan ko'p bo'lmagan son kiriting yoki menyuga qayting.`,
      //           {
      //             reply_markup: {
      //               inline_keyboard: [
      //                 [
      //                   {
      //                     text: user.telegramLanguage === "ru" ? "🔙 Вернуться в меню" : "🔙 Menyuga qaytish",
      //                     callback_data: "back-to-menu"
      //                   }
      //                 ]
      //               ]
      //             },
      //             parse_mode: "HTML"
      //           }
      //         );
      //       }
      //       return;
      //     }

      //     // Save the worker count
      //     await UsersService.update(chatId, { workerCount: workerCount, telegramStep: 40 });
      //     user = await UsersService.getUserByChatId(chatId);

      //     // Calculate price based on worker count
      //     const price = getPriceByWorkerCount(workerCount);

      //     // Display payment options
      //     await ctx.reply(
      //       user.telegramLanguage === "ru" ?
      //         `Найдено ${availableWorkerCount} работников. Стоимость доступа к контактам ${workerCount} работников составляет ${price.toLocaleString()} сум. Выберите действие:` :
      //         `${availableWorkerCount} ta ishchi topildi. ${workerCount} ta ishchi kontaktlari uchun narx ${price.toLocaleString()} so'm. Harakat tanlang:`,
      //       {
      //         reply_markup: {
      //           inline_keyboard: [
      //             [
      //               {
      //                 text: user.telegramLanguage === "ru" ? "💰 Произвести оплату" : "💰 To'lovni amalga oshirish",
      //                 callback_data: "make_payment"
      //               }
      //             ],
      //             [
      //               {
      //                 text: user.telegramLanguage === "ru" ? "✅ Проверить оплату" : "✅ To'lovni tekshirish",
      //                 callback_data: "check_payment"
      //               }
      //             ],
      //             [
      //               {
      //                 text: user.telegramLanguage === "ru" ? "🔙 Назад в меню" : "🔙 Menyuga qaytish",
      //                 callback_data: "back-to-menu"
      //               }
      //             ]
      //           ]
      //         },
      //         parse_mode: "HTML"
      //       }
      //     );
      //     await deleteAllPreviousMessages(ctx, chatId, messageId);
      //   } catch (error) {
      //     console.error('Error handling worker count input:', error);
      //     await ctx.reply(
      //       user.telegramLanguage === "ru" ?
      //         "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз." :
      //         "So'rovni qayta ishlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
      //     );
      //   }
      // }
      else if (user && user.telegramStep === 30 && user.type === "enterprise") {
        // Validate input is a number
        const workerCount = parseInt(text);

        if (isNaN(workerCount) || workerCount <= 0) {
          await ctx.reply(
            user.telegramLanguage === "ru" ?
              "Пожалуйста, введите положительное число." :
              "Iltimos, musbat son kiriting."
          );
          return;
        }

        try {
          // Get the selected work directions
          const selectedWorksString = user.selectedWorks || '[]';
          let selectedWorkIds = [];
          try {
            selectedWorkIds = JSON.parse(selectedWorksString);
          } catch (error) {
            console.error('Error parsing selectedWorks:', error);
          }

          // Check how many workers match the selected work directions
          let matchingWorkers = [];

          // Determine which type of workers to search for
          const workerType = user.workerSearchType || 'regular'; // Default to regular workers if not specified
          console.log(`Searching for worker type: ${workerType}`);

          if (selectedWorkIds.length > 0) {
            // Get workers that match the selected work directions and worker type
            matchingWorkers = await WorkerService.getWorkersBySpecializations(selectedWorkIds, workerType);
            console.log(`Found ${matchingWorkers.length} workers matching the selected specializations and type ${workerType}`);
          } else {
            // If no work directions were selected, get all workers of specified type
            // Since we need to filter by worker type, we'll use the specialized method with an empty array
            matchingWorkers = await WorkerService.getWorkersBySpecializations([], workerType);
            console.log(`No specializations selected, found ${matchingWorkers.length} total ${workerType} workers`);
          }

          const availableWorkerCount = matchingWorkers.length;

          // If there are fewer available workers than requested
          if (availableWorkerCount < workerCount) {
            // Create a different message and button setup depending on whether there are any workers at all
            if (availableWorkerCount === 0) {
              // No workers available - show message with only return to menu button
              await ctx.reply(
                user.telegramLanguage === "ru" ?
                  `По выбранным направлениям нет доступных работников. Пожалуйста, вернитесь в меню и выберите другие направления.` :
                  `Tanlangan yo'nalishlar bo'yicha ishchi mavjud emas. Iltimos, menyuga qayting va boshqa yo'nalishlarni tanlang.`,
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: user.telegramLanguage === "ru" ? "🔙 Вернуться в меню" : "🔙 Menyuga qaytish",
                          callback_data: "back-to-menu"
                        }
                      ]
                    ]
                  },
                  parse_mode: "HTML"
                }
              );
            } else {
              // Some workers available but fewer than requested - show message with return to menu button
              await ctx.reply(
                user.telegramLanguage === "ru" ?
                  `Доступно только ${availableWorkerCount} работников по выбранным направлениям. Пожалуйста, введите число не больше ${availableWorkerCount} или вернитесь в меню.` :
                  `Tanlangan yo'nalishlar bo'yicha faqat ${availableWorkerCount} ta ishchi mavjud. Iltimos, ${availableWorkerCount} dan ko'p bo'lmagan son kiriting yoki menyuga qayting.`,
                {
                  reply_markup: {
                    inline_keyboard: [
                      [
                        {
                          text: user.telegramLanguage === "ru" ? "🔙 Вернуться в меню" : "🔙 Menyuga qaytish",
                          callback_data: "back-to-menu"
                        }
                      ]
                    ]
                  },
                  parse_mode: "HTML"
                }
              );
            }
            return;
          }

          // Save the worker count
          await UsersService.update(chatId, { workerCount: workerCount, telegramStep: 14 });
          user = await UsersService.getUserByChatId(chatId);

          // Calculate price based on worker count
          const price = getPriceByWorkerCount(workerCount);
          try {
            // Get the selected works IDs
            const selectedWorksString = user.selectedWorks || '[]';
            let selectedWorkIds = [];
  
            try {
              selectedWorkIds = JSON.parse(selectedWorksString);
              console.log('Selected work IDs for worker filtering:', selectedWorkIds);
            } catch (error) {
              console.error('Error parsing selectedWorks:', error);
            }
  
            // Get workers matching the enterprise's selected works
            let matchedWorkers = [];
  
            if (selectedWorkIds && selectedWorkIds.length > 0) {
              // Get workers based on the selected specializations/works
              matchedWorkers = await WorkerService.getWorkersBySpecializations(selectedWorkIds);
              console.log(`Found ${matchedWorkers.length} workers matching selected specializations`);
            } else {
              // If no works selected, get all workers as fallback
              matchedWorkers = await WorkerService.getAll();
              console.log('No specializations selected, using all workers');
            }
  
            // Limit to the number requested
            const workers = matchedWorkers.slice(0, workerCount);
  
            // Generate Excel file with worker data
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Workers');
  
            // Add headers
            worksheet.columns = [
              { header: user.telegramLanguage === "ru" ? 'Полное имя' : 'To\'liq ismi', key: 'fullName', width: 20 },
              { header: user.telegramLanguage === "ru" ? 'Пол' : 'Jinsi', key: 'gender', width: 10 },
              { header: user.telegramLanguage === "ru" ? 'Телефон' : 'Telefon', key: 'phone', width: 15 },
              { header: user.telegramLanguage === "ru" ? 'Адрес проживания' : 'Yashash manzili', key: 'residentialAddress', width: 25 },
              { header: user.telegramLanguage === "ru" ? 'Рабочая зона' : 'Ishlash hududi', key: 'workingArea', width: 20 },
              { header: user.telegramLanguage === "ru" ? 'Специализация' : 'Mutaxassislik', key: 'specialization', width: 30 },
              { header: user.telegramLanguage === "ru" ? 'Профессия' : 'Kasbi', key: 'profession', width: 20 },
              { header: user.telegramLanguage === "ru" ? 'Опыт' : 'Tajriba', key: 'experience', width: 15 },
              { header: user.telegramLanguage === "ru" ? 'Дополнительные навыки' : 'Qo\'shimcha ko\'nikmalar', key: 'additionalSkills', width: 30 },
              { header: user.telegramLanguage === "ru" ? 'Минимальная зарплата' : 'Minimal ish haqi', key: 'minimumWage', width: 15 },
            ];
  
            // Add rows for each worker
            workers.forEach(worker => {
              worksheet.addRow({
                fullName: worker.fullName || '-',
                gender: worker.gender === 'male' ?
                  (user.telegramLanguage === "ru" ? 'Мужской' : 'Erkak') :
                  (user.telegramLanguage === "ru" ? 'Женский' : 'Ayol'),
                phone: worker.user?.phoneNumber || '-',
                residentialAddress: worker.residentialAddress || '-',
                // Format working area - handle array format if it's JSON string
                workingArea: (() => {
                  try {
                    if (worker.workingArea && worker.workingArea.startsWith('[') && worker.workingArea.endsWith(']')) {
                      // Parse the JSON array
                      const areas = JSON.parse(worker.workingArea);
  
                      // Filter to get only valid locations
                      const validAreas = allLocations.filter((loc: { id: string }) => areas.includes(loc.id));
  
                      // Format based on user language
                      return validAreas.map((loc: { nameRu: string, name: string }) =>
                        user.telegramLanguage === "ru" ? loc.nameRu : loc.name
                      ).join(", ");
                    }
                    // If not in JSON format or parsing fails, use as is
                    return worker.workingArea || '-';
                  } catch (error) {
                    console.error('Error formatting working area for Excel:', error);
                    return worker.workingArea || '-';
                  }
                })(),
                specialization: Array.isArray(worker.specialization) ? worker.specialization.join(', ') : worker.specialization || '-',
                profession: worker.profession || '-',
                experience: worker.experience || '-',
                additionalSkills: Array.isArray(worker.additionalSkills) ? worker.additionalSkills.join(', ') : worker.additionalSkills || '-',
                minimumWage: worker.minimumWage ? `${worker.minimumWage} ${user.telegramLanguage === "ru" ? 'сум' : 'so\'m'}` : '-',
              });
            });
  
            // Generate buffer from workbook
            const buffer = await workbook.xlsx.writeBuffer();
            const readable = new Readable();
            readable.push(buffer);
            readable.push(null);
  
            // Send file to user
            await ctx.replyWithDocument({
              source: readable,
              filename: `workers_list_${new Date().toISOString().slice(0, 10)}.xlsx`
            }, {
              caption: user.telegramLanguage === "ru" ?
                `Список ${workers.length} работников.` :
                `${workers.length} ta ishchi ro'yxati.`
            });
  
            // Clear the saved receipt ID after using it
            await UsersService.update(chatId, { selectedReceiptId: null });
  
            // Show enterprise menu after sending Excel file
            await ctx.reply(
              contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
              contents.menu.uz,
              {
                ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
                parse_mode: "HTML",
              }
            );
          } catch (error) {
            console.error('Error generating worker list Excel:', error);
            await ctx.reply(
              user.telegramLanguage === "ru" ?
                "Произошла ошибка при формировании списка работников. Пожалуйста, попробуйте позже." :
                "Ishchilar ro'yxatini tayyorlashda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
              {
                ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
                parse_mode: "HTML",
              }
            );
          }

          // await ctx.reply(
          //   contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
          //   contents.menu.uz,
          //   {
          //     ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          //     parse_mode: "HTML",
          //   }
          // );
          await deleteAllPreviousMessages(ctx, chatId, messageId);
        } catch (error) {
          console.error('Error handling worker count input:', error);
          await ctx.reply(
            user.telegramLanguage === "ru" ?
              "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз." :
              "So'rovni qayta ishlashda xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring."
          );
        }
      }
      else if (user && user.telegramStep === 30 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        // Save current page in user state
        await UsersService.update(chatId, { currentPage: 1 });
        await deleteAllPreviousMessages(ctx, chatId);

        // Get worker information to check if they are a student/apprentice
        const worker = await WorkerService.getByUserId(user.id);

        // Determine which type of vacancies to show
        let vacancyType = 'work'; // Default to regular work

        // If vacancySearchType is explicitly set in user data, use that
        if (user.vacancySearchType === 'student' || user.vacancySearchType === 'work') {
          vacancyType = user.vacancySearchType;
          console.log(`Using specified vacancy search type: ${vacancyType}`);
        }
        // Otherwise, fall back to worker's is_student status
        else if (worker?.is_student) {
          vacancyType = 'student';
          console.log('Using default vacancy search type based on worker.is_student: student');
        } else {
          console.log('Using default vacancy search type: work');
        }

        // Get active vacancies with type filter applied directly in the database query
        console.log(`Fetching vacancies with type: ${vacancyType}`);
        const vacancies = await VacancyService.getAllActiveVacancies(text, vacancyType);

        // If no vacancies are available
        if (!vacancies || vacancies.length === 0) {
          await ctx.reply(
            contents.noVacanciesFound[user?.telegramLanguage as keyof typeof contents.noVacanciesFound] ||
            "Tez orada sizga aloqaga chiqamiz.",
            {
              ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
              parse_mode: "HTML",
            });
          return;
        }

        // Store vacancies in user session and set initial page to 1
        await UsersService.update(chatId, {
          vacancyList: JSON.stringify(vacancies),
          currentPage: 1
        });

        // Calculate pagination - using 6 vacancies per page
        const pageSize = 6;
        const page = 1;
        const totalPages = Math.ceil(vacancies.length / pageSize);
        const hasNext = page < totalPages;

        // Get vacancies for current page
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, vacancies.length);
        const currentPageVacancies = vacancies.slice(startIndex, endIndex);

        // Create vacancy list message
        let vacancyListMessage = `<b>${contents.vacancyList[user?.telegramLanguage as keyof typeof contents.vacancyList] || "Vakansiyalar ro'yxati"}:</b>\n\n`;

        currentPageVacancies.forEach((vacancy, index) => {
          // Safely handle potentially null enterprise objects
          const enterprise = vacancy.enterprise || {};
          // Show only the first specialist or limit to a shorter preview
          const specialistPreview = vacancy.specialist && vacancy.specialist.length > 0 ?
            (Array.isArray(vacancy.specialist) ?
              (vacancy.specialist + (vacancy.specialist.length > 1 ? "..." : "")) :
              vacancy.specialist) :
            "";

          // Compact format: number. company name - position (salary) location
          // Use index + 1 for display (1-6) rather than absolute position
          vacancyListMessage += `<b>${index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
        });

        vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${page}/${totalPages}\n`;
        vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
        vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;

        // Send message with pagination keyboard
        await ctx.reply(vacancyListMessage, {
          ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](page, hasNext, currentPageVacancies.length),
          parse_mode: "HTML",
        });
      }
      // WORKER SEARCH WORK END ---------------------------
    } catch (error) {
      console.error("Error handling /start command:", error instanceof Error ? error.message : error);
    }
  }
});

bot.on("contact", async (ctx) => {
  const chatId: any = ctx.chat?.id;
  let user: any = await UsersService.getUserByChatId(chatId);
  try {
    var phoneNumber = ctx.message.contact.phone_number;
    const messageId = ctx.message.message_id;

    const phoneNum = phoneNumber.replace("+", "");

    // Delete previous messages before sending a new one
    await deleteAllPreviousMessages(ctx, chatId);

    if (user.type === "enterprise") {
      await ctx.reply(contents.enterpriseName[user?.telegramLanguage as keyof typeof contents.enterpriseName] ||
        contents.enterpriseName.uz,
        {
          parse_mode: "HTML",
        });
    }
    if (user.type === "worker") {
      await ctx.reply(contents.fullName[user?.telegramLanguage as keyof typeof contents.fullName] ||
        contents.fullName.uz,
        {
          parse_mode: "HTML",
        });
    }
    await UsersService.update(chatId, { phoneNumber: phoneNum, telegramStep: 3 });
  } catch (error) {
    console.error("Xatolik yuz berdi:", error instanceof Error ? error.message : error);
  }
});

export default bot;
