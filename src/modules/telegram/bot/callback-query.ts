import { Composer, Context } from "telegraf";
import { ParseMode } from "telegraf/typings/core/types/typegram";
import {
  contact_keyboard,
  worker_menu_keyboard,
  language_keyboard,
  register_type_keyboard,
  enterprise_menu_keyboard,
  worker_settings_keyboard,
  enterprise_settings_keyboard,
  gender_keyboard,
  vote_keyboard,
  vacancy_pagination_keyboard,
  worker_count_keyboard,
  back_to_menu_keyboard,
  location_keyboard
} from "./keyboards";
import { generateWorkSelectionKeyboard, formatSelectedWorksMessage } from "./multiselect-keyboard";
import { generateLocationMultiselectKeyboard, formatSelectedLocationsMessage } from "./location-multiselect";
import { deleteAllPreviousMessages, isSubscribedToChannel, sendSubscriptionMessage } from "../utils/channel";
import contents from "../contents/contents";
import UsersService from "../../../modules/user/service";
import WorkerService from "../../../modules/worker/service";
import EnterpriseService from "../../../modules/enterprise/service";
import VacancyService from "../../../modules/vacancy/service";
import WorkService from "../../../modules/work/service";
import ReceiptService from "../../../modules/receipt/service";
import { IReceipt } from "../../../domain/Receipt";
import { getPriceByWorkerCount } from "../../../utils/getPriceByWorkerCount";
import ExcelJS from 'exceljs';
import { Readable } from 'stream';
const bot = new Composer();

bot.on("callback_query", async (ctx) => {
  const callbackQuery: any = ctx.callbackQuery;
  const chatId = callbackQuery.message.chat.id;
  const userId = callbackQuery.from.id;
  const text = callbackQuery.data;
  let user: any = await UsersService.getUserByChatId(chatId);

  if (text === "check_subscription") {
    const isSubscribed = await isSubscribedToChannel(ctx, userId);

    if (isSubscribed) {
      if (!user) {
        const newUser: any = callbackQuery.from;
        const data = {
          chatId: chatId,
          fullName: `${newUser.first_name}`,
          telegramLanguage: newUser.language_code,
        };
        user = await UsersService.create(data);
      }

      // Delete previous messages before sending a new one
      await deleteAllPreviousMessages(ctx, chatId);

      await ctx.telegram.sendMessage(
        chatId,
        contents.selectLanguage[user?.telegramLanguage as keyof typeof contents.selectLanguage] ||
        contents.selectLanguage.uz,
        {
          ...language_keyboard,
          parse_mode: "HTML",
        }
      );
    } else {
      await sendSubscriptionMessage(ctx, callbackQuery.from.language_code);
    }
    await ctx.answerCbQuery();
  }

  else if (text === "uz") {
    await UsersService.update(chatId, { telegramLanguage: "uz", telegramStep: 1 });
    user = await UsersService.getUserByChatId(chatId);

    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.registerType[user?.telegramLanguage as keyof typeof contents.phoneNumber] ||
      contents.registerType.uz,
      {
        ...register_type_keyboard[user?.telegramLanguage as keyof typeof register_type_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }

  else if (text === "ru") {
    await UsersService.update(chatId, { telegramLanguage: "ru", telegramStep: 1 });
    user = await UsersService.getUserByChatId(chatId);
    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.registerType[user?.telegramLanguage as keyof typeof contents.registerType] ||
      contents.registerType.ru,
      {
        ...register_type_keyboard[user?.telegramLanguage as keyof typeof register_type_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 2, type: "enterprise" });
    await EnterpriseService.create({ user });
    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.phoneNumber[user?.telegramLanguage as keyof typeof contents.phoneNumber] ||
      contents.phoneNumber.uz,
      {
        ...contact_keyboard[user?.telegramLanguage as keyof typeof contact_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker") {
    await UsersService.update(chatId, { telegramStep: 2, type: "worker" });
    await WorkerService.create({ user });
    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.phoneNumber[user?.telegramLanguage as keyof typeof contents.phoneNumber] ||
      contents.phoneNumber.uz,
      {
        ...contact_keyboard[user?.telegramLanguage as keyof typeof contact_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "yes" && user.type === "worker" && user.telegramStep === 14) {
    await UsersService.update(chatId, { telegramStep: 14 });
    await WorkerService.update(user.id, { workInACityOtherThanTheResidentialAddress: true });
    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "no" && user.type === "worker" && user.telegramStep === 14) {
    await UsersService.update(chatId, { telegramStep: 14 });
    await WorkerService.update(user.id, { workInACityOtherThanTheResidentialAddress: false });
    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "male" && user.type === "worker" && user.telegramStep === 5) {
    await UsersService.update(chatId, { telegramStep: 6 });
    await WorkerService.update(user.id, { gender: "male" });

    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.residentialAddress[user.telegramLanguage as keyof typeof contents.residentialAddress] ||
      contents.residentialAddress.uz,
      {
        ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "female" && user.type === "worker" && user.telegramStep === 5) {
    await UsersService.update(chatId, { telegramStep: 6 });
    await WorkerService.update(user.id, { gender: "female" });

    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.residentialAddress[user.telegramLanguage as keyof typeof contents.residentialAddress] ||
      contents.residentialAddress.uz,
      {
        ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }

  //Vacancy
  else if (text === "new-vacancy" && user.type === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 7 });
    const enterprise = await EnterpriseService.getByUserId(user.id);
    await VacancyService.create({ enterprise });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.vacancySpecialists[user?.telegramLanguage as keyof typeof contents.vacancySpecialists] ||
      contents.vacancySpecialists.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "yes" && user.type === "enterprise" && user.telegramStep === 12) {
    await UsersService.update(chatId, { telegramStep: 6 });
    const enterprise = await EnterpriseService.getByUserId(user.id);
    const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
    await VacancyService.updateStatus(vacancy?.id, "active")
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "no" && user.type === "enterprise" && user.telegramStep === 12) {
    await UsersService.update(chatId, { telegramStep: 7 });
    const enterprise = await EnterpriseService.getByUserId(user.id);
    await VacancyService.create({ enterprise });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.vacancySpecialists[user?.telegramLanguage as keyof typeof contents.vacancySpecialists] ||
      contents.vacancySpecialists.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "settings" && user.type === "enterprise") {
    const enterprise = await EnterpriseService.getByUserId(user.id);
    await VacancyService.create({ enterprise });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.settings[user?.telegramLanguage as keyof typeof contents.settings] ||
      contents.settings.uz,
      {
        ...enterprise_settings_keyboard[user?.telegramLanguage as keyof typeof enterprise_settings_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "enterprise-edit-fullname" && user.type === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 15 });
    const enterprise = await EnterpriseService.getByUserId(user.id);

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.enterpriseName[user?.telegramLanguage as keyof typeof contents.enterpriseName] ||
      contents.enterpriseName.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  // else if (text === "enterprise-edit-address" && user.type === "enterprise") {
  //   await UsersService.update(chatId, { telegramStep: 16 });
  //   const enterprise = await EnterpriseService.getByUserId(user.id);

  //   await deleteAllPreviousMessages(ctx, chatId);

  //   await ctx.reply(contents.enterpriseAddress[user?.telegramLanguage as keyof typeof contents.enterpriseAddress] ||
  //     contents.enterpriseAddress.uz,
  //     {
  //       parse_mode: "HTML",
  //     });
  //   await ctx.answerCbQuery();
  // }
  else if (text === "enterprise-edit-address" && user.type === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 16 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.enterpriseAddress[user?.telegramLanguage as keyof typeof contents.enterpriseAddress] ||
      contents.enterpriseAddress.uz,
      {
        ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "enterprise-edit-type-of-activity" && user.type === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 17 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.enterpriseTypeOfActivity[user?.telegramLanguage as keyof typeof contents.enterpriseTypeOfActivity] ||
      contents.enterpriseTypeOfActivity.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "settings" && user.type === "worker") {
    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.settings[user?.telegramLanguage as keyof typeof contents.settings] ||
      contents.settings.uz,
      {
        ...worker_settings_keyboard[user?.telegramLanguage as keyof typeof worker_settings_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }

  // WORKER EDIT INFO ---------------------------
  else if (text === "worker-edit-fullname" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 15 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.fullName[user?.telegramLanguage as keyof typeof contents.fullName] ||
      contents.fullName.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-birthdate" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 16 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.birthDate[user?.telegramLanguage as keyof typeof contents.birthDate] ||
      contents.birthDate.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-gender" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 17 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.gender[user?.telegramLanguage as keyof typeof contents.gender] ||
      contents.gender.uz,
      {
        ...gender_keyboard[user?.telegramLanguage as keyof typeof gender_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "male" && user.type === "worker" && user.telegramStep === 17) {
    await UsersService.update(chatId, { telegramStep: 14 });
    await WorkerService.update(user.id, { gender: "male" });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "female" && user.type === "worker" && user.telegramStep === 17) {
    await UsersService.update(chatId, { telegramStep: 14 });
    await WorkerService.update(user.id, { gender: "female" });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-residential-address" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 18 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.residentialAddress[user.telegramLanguage as keyof typeof contents.residentialAddress] ||
      contents.residentialAddress.uz,
      {
        ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-working-area" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 19 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(
      contents.workingArea[user.telegramLanguage as keyof typeof contents.workingArea] ||
      contents.workingArea.uz,
      {
        ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-passport-serial-number" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 20 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.passportSerialNumber[user?.telegramLanguage as keyof typeof contents.passportSerialNumber] ||
      contents.passportSerialNumber.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-specialization" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 21 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.specialization[user?.telegramLanguage as keyof typeof contents.specialization] ||
      contents.specialization.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }

  else if (text === "worker-edit-experience" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 23 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.experience[user?.telegramLanguage as keyof typeof contents.experience] ||
      contents.experience.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-additional-skills" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 24 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.additionalSkills[user?.telegramLanguage as keyof typeof contents.additionalSkills] ||
      contents.additionalSkills.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-minimum-wage" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 25 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.minimumWage[user?.telegramLanguage as keyof typeof contents.minimumWage] ||
      contents.minimumWage.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-work-in-a-city-other-than-the-residential-address" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 26 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.workInACityOtherThanTheResidentialAddress[user?.telegramLanguage as keyof typeof contents.workInACityOtherThanTheResidentialAddress] ||
      contents.workInACityOtherThanTheResidentialAddress.uz,
      {
        ...vote_keyboard[user?.telegramLanguage as keyof typeof vote_keyboard],
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "yes" && user.type === "worker" && user.telegramStep === 26) {
    await UsersService.update(chatId, { telegramStep: 14 });
    await WorkerService.update(user.id, { workInACityOtherThanTheResidentialAddress: true });
    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  else if (text === "no" && user.type === "worker" && user.telegramStep === 26) {
    await UsersService.update(chatId, { telegramStep: 14 });
    await WorkerService.update(user.id, { workInACityOtherThanTheResidentialAddress: false });
    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  // WORKER EDIT INFO END ---------------------------

  // WORKER SEARCH WORK ---------------------------
  else if (text === "search-work" && user.type === "worker") {
    // Clear previous search data and reset to initial search state
    await UsersService.update(chatId, { 
      telegramStep: 30, 
      vacancyList: null,  // Clear old vacancy list data
      currentPage: 1      // Reset pagination to first page
    });

    await deleteAllPreviousMessages(ctx, chatId);  // Clear previous messages

    await ctx.reply(
      contents.searchWork[user.telegramLanguage as keyof typeof contents.searchWork] ||
      contents.searchWork.uz,
      {
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  // Handle numeric vacancy selection (when user clicks on a vacancy number)
  else if (/^\d+$/.test(text) && user?.telegramStep === 14 && user?.type === "worker") {
    try {
      // Get stored vacancies from user session
      const vacancyListString = user.vacancyList;
      if (!vacancyListString) {
        await ctx.answerCbQuery("Vakansiyalar ma'lumotlari topilmadi");
        return;
      }
      
      const vacancies = JSON.parse(vacancyListString);
      
      // Calculate actual index based on current page
      const currentPage = user.currentPage || 1;
      const pageSize = 6; // Using 6 vacancies per page
      const startIndex = (currentPage - 1) * pageSize;
      
      // Adjust vacancy index to account for pagination
      const vacancyDisplayNumber = parseInt(text);
      
      // The display number (1-6) corresponds to the position on the current page
      // So we need to calculate the absolute index in the vacancies array
      const vacancyIndex = startIndex + vacancyDisplayNumber - 1;
      
      console.log(`Selecting vacancy: display #${vacancyDisplayNumber}, page ${currentPage}, absolute index ${vacancyIndex}`);
      
      // Check if vacancy exists at this index
      if (vacancyIndex < 0 || vacancyIndex >= vacancies.length) {
        await ctx.answerCbQuery("Tanlangan vakansiya mavjud emas");
        console.log(`Vacancy not found: index ${vacancyIndex} is out of range (0-${vacancies.length-1})`);
        return;
      }
      
      const vacancy = vacancies[vacancyIndex];
      // Safely handle potentially null enterprise objects
      const enterprise = vacancy.enterprise || {};
      const enterpriseUser = enterprise.user || {};
      
      // Create detailed vacancy message with full specialists list and company information
      let detailedVacancyMessage = `<b>🏢 ${(enterprise && enterprise.name) || "Korxona"}</b>\n\n`;
      
      // Show full specialists list
      detailedVacancyMessage += `📋 <b>${contents.position[user?.telegramLanguage as keyof typeof contents.position] || "Lavozim"}:</b> ${vacancy.specialists ? (Array.isArray(vacancy.specialists) ? vacancy.specialists.join(", ") : vacancy.specialists) : ""}\n\n`;
      detailedVacancyMessage += `💰 <b>${contents.salary[user?.telegramLanguage as keyof typeof contents.salary] || "Maosh"}:</b> ${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}\n`;
      detailedVacancyMessage += `📍 <b>${contents.location[user?.telegramLanguage as keyof typeof contents.location] || "Manzil"}:</b> ${vacancy.area}\n\n`;
      
      // Add additional vacancy details
      if (vacancy.minimumExperience) {
        detailedVacancyMessage += `⏱ <b>${contents.vacancyMinimumExperience[user?.telegramLanguage as keyof typeof contents.vacancyMinimumExperience] || "Minimal tajriba"}:</b> ${vacancy.minimumExperience}\n`;
      }
      
      if (vacancy.opportunitiesForWorkers) {
        detailedVacancyMessage += `🌟 <b>${contents.vacancyOpportunitiesForWorkers[user?.telegramLanguage as keyof typeof contents.vacancyOpportunitiesForWorkers] || "Ishchilar uchun imkoniyatlar"}:</b> ${vacancy.opportunitiesForWorkers}\n\n`;
      }
      
      // Company contact information section - improved to ensure all info is shown
      detailedVacancyMessage += `<b>📞 Aloqa ma'lumotlari:</b>\n`;
      
      // Always include full contact information with clear labels
      detailedVacancyMessage += `📱 <b>Telefon raqami:</b> ${enterpriseUser.phoneNumber || "Ma'lumot yo'q"}\n`;
      detailedVacancyMessage += `👤 <b>Mas'ul shaxs:</b> ${enterpriseUser.fullName || "Ma'lumot yo'q"}\n`;
      
      // Include Telegram username if available
      if (enterpriseUser.username) {
        detailedVacancyMessage += `💬 <b>Telegram:</b> @${enterpriseUser.username}\n`;
      }
      
      // Send the detailed vacancy information as plain text with better formatting
      await ctx.reply(detailedVacancyMessage, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "⬅️ Orqaga", callback_data: "back_to_vacancy_list" }
            ]
          ]
        }
      });
      
      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling vacancy selection:", error);
      await ctx.answerCbQuery("Xatolik yuz berdi");
    }
  }
  
  // Handle enterprise worker search - start by asking for worker count
  else if (text === "search-worker" && user?.type === "enterprise") {
    try {
      // Delete previous messages
      await deleteAllPreviousMessages(ctx, chatId);
      
      // Get enterprise data
      const enterprise = await EnterpriseService.getByUserId(user.id);
      
      if (!enterprise) {
        await ctx.reply(
          user.telegramLanguage === "ru" ? 
            "Ошибка: данные предприятия не найдены. Пожалуйста, свяжитесь с поддержкой." : 
            "Xatolik: korxona ma'lumotlari topilmadi. Iltimos, qo'llab-quvvatlash xizmatiga murojaat qiling.",
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          }
        );
        return;
      }
      
      // First step: Ask to select work directions/fields
      await UsersService.update(chatId, { telegramStep: 28 }); // New step for work direction selection
      user = await UsersService.getUserByChatId(chatId);
      
      // Get all available works
      const works = await WorkService.getAll();
      
      if (!works || works.length === 0) {
        await ctx.reply(
          user.telegramLanguage === "ru" ? 
            "Ошибка: не удалось загрузить направления работы. Пожалуйста, попробуйте позже." : 
            "Xatolik: ish yo'nalishlarini yuklashda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          }
        );
        return;
      }
      
      // Save works list to user session
      const worksListString = JSON.stringify(works);
      await UsersService.update(chatId, { worksList: worksListString, selectedWorks: '[]' });
      
      // Display message asking to select directions
      const promptMessage = contents.searchWorkerDirections[user?.telegramLanguage as keyof typeof contents.searchWorkerDirections] ||
        contents.searchWorkerDirections.uz;
      
      // Generate keyboard for work selection
      const keyboard = generateWorkSelectionKeyboard(works, [], user.telegramLanguage);
      
      await ctx.reply(promptMessage, {
        ...keyboard,
        parse_mode: "HTML" as ParseMode,
      });
      
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in search-worker handler:', error);
      await ctx.reply(
        user.telegramLanguage === "ru" ? 
          "Произошла ошибка. Пожалуйста, попробуйте позже." : 
          "Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    }
  }
  
  // Handle worker count selection
  else if (text.startsWith("worker-count-") && user?.type === "enterprise" && (user.telegramStep === 29 || user.telegramStep === 30)) {
    const count = parseInt(text.replace("worker-count-", ""));
    // Save the selected worker count
    await UsersService.update(chatId, { workerCount: count });
    user = await UsersService.getUserByChatId(chatId);
    
    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);
    
    // Get the price for the selected worker count from the JSON file
    const price = getPriceByWorkerCount(count);
    
    // Check if the enterprise has any verified payment for worker search
    const receipts = await ReceiptService.getReceiptsByUser({
      userId: user.id,
      user: user
    });
    
    // Check if there's a valid paid receipt
    const hasValidReceipt = receipts && receipts.some((receipt: any) => 
      receipt.status === 'paid' && receipt.purpose === 'worker_search' && !receipt.isUsed
    );
    
    if (hasValidReceipt) {
      // If enterprise has already paid, proceed to specialization input
      await UsersService.update(chatId, { telegramStep: 31 });
      user = await UsersService.getUserByChatId(chatId);
      
      await ctx.reply(
        user.telegramLanguage === "ru" ? 
          "Какие специалисты вам нужны? Пожалуйста, укажите специальность:" : 
          "Qanday mutaxassislar kerak? Iltimos, mutaxassislikni kiriting:",
        {
          ...back_to_menu_keyboard[user?.telegramLanguage as keyof typeof back_to_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    } else {
      // If no valid receipt found, show payment options
      await UsersService.update(chatId, { telegramStep: 40 }); // Step for payment flow
      
      // Format the price with commas
      const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
      // Send payment message with the calculated price
      const paymentMessage = user.telegramLanguage === "ru" ?
        `Для получения списка ${count} работников необходимо оплатить услугу. Стоимость: ${formattedPrice} сум.` :
        `${count} ta ishchini qidirish uchun xizmat uchun to'lov qilishingiz kerak. Narxi: ${formattedPrice} so'm.`;
        
      await ctx.reply(paymentMessage, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.telegramLanguage === "ru" ? "💰 Оплатить" : "💰 To'lov qilish",
                callback_data: "make_payment"
              }
            ],
            [
              {
                text: user.telegramLanguage === "ru" ? "✅ Проверить оплату" : "✅ To'lovni tekshirish",
                callback_data: "check_payment"
              }
            ],
            [
              {
                text: user.telegramLanguage === "ru" ? "🔙 Назад в меню" : "🔙 Menyuga qaytish",
                callback_data: "back-to-menu"
              }
            ]
          ]
        }
      });
    }
    await ctx.answerCbQuery();
  }
  
  // Handle payment for worker search
  else if (text === "make_payment" && user?.type === "enterprise" && user.telegramStep === 40) {
    try {
      // Get the worker count from user data
      const workerCount = user.workerCount || 1;
      
      // Get the price for the selected worker count from the JSON file
      const price = getPriceByWorkerCount(workerCount);
      
      // Create a new receipt for the worker search payment with the calculated price
      const paymentUrl = await ReceiptService.insertReceipt({
        userId: user.id,
        user: user,
        amount: price,
        method: "paymeUrl",
        platform: "payme",
        paymentIndex: 0, // This will be set by the service
        purpose: "worker_search"
      });
      
      if (!paymentUrl) {
        await ctx.reply(
          user.telegramLanguage === "ru" ? 
            "Ошибка при создании платежа. Пожалуйста, попробуйте позже." : 
            "To'lov yaratishda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          }
        );
        return;
      }
      
      // Format the price with commas for display
      const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      
      // Send payment link to the user
      await ctx.reply(
        user.telegramLanguage === "ru" ? 
          `Для получения списка ${workerCount} работников оплатите ${formattedPrice} сум по ссылке:\n${paymentUrl}\n\nПосле оплаты нажмите «Проверить оплату».` : 
          `${workerCount} ta ishchi ro'yxatini olish uchun ${formattedPrice} so'mni quyidagi havola orqali to'lang:\n${paymentUrl}\n\nTo'lovdan so'ng "To'lovni tekshirish" tugmasini bosing.`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.telegramLanguage === "ru" ? "✅ Проверить оплату" : "✅ To'lovni tekshirish",
                  callback_data: "check_payment"
                }
              ],
              [
                {
                  text: user.telegramLanguage === "ru" ? "🔙 Назад в меню" : "🔙 Menyuga qaytish",
                  callback_data: "back-to-menu"
                }
              ]
            ]
          }
        }
      );
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in make_payment handler:', error);
      await ctx.reply(
        user.telegramLanguage === "ru" ? 
          "Произошла ошибка. Пожалуйста, попробуйте позже." : 
          "Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
      });
    }
  }
  
  else if (text === "check_payment" && user?.type === "enterprise") {
    try {
      // Get the worker count from user data
      const workerCount = user.workerCount || 1;
      
      // Fetch receipts for this user
      const receipts = await ReceiptService.getReceiptsByUser({
        userId: user.id,
        user: user
      });
      
      const validReceipt = receipts && receipts.find((receipt: any) => 
        receipt.status === 'paid' && receipt.purpose === 'worker_search' && !receipt.isUsed
      );
      
      if (validReceipt) {
        if (!validReceipt.workerCount) {
          await ReceiptService.updateReceipt({
            receiptId: validReceipt.id,
            receipt: validReceipt,
            amount: validReceipt.amount,
            method: validReceipt.method as string,
            platform: validReceipt.platform as string,
            workerCount: workerCount
          });
        }
        
        await UsersService.update(chatId, { telegramStep: 31 });
        user = await UsersService.getUserByChatId(chatId);
        
        await ctx.reply(
          user.telegramLanguage === "ru" ? 
            `\u041e\u043f\u043b\u0430\u0442\u0430 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430! \u0422\u0435\u043f\u0435\u0440\u044c \u0432\u044b \u043c\u043e\u0436\u0435\u0442\u0435 \u043f\u043e\u043b\u0443\u0447\u0438\u0442\u044c \u0441\u043f\u0438\u0441\u043e\u043a ${workerCount} \u0440\u0430\u0431\u043e\u0442\u043d\u0438\u043a\u043e\u0432.\n\n\u041a\u0430\u043a\u0438\u0435 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442\u044b \u0432\u0430\u043c \u043d\u0443\u0436\u043d\u044b? \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0443\u043a\u0430\u0437\u0438\u0442\u0435 \u0441\u043f\u0435\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u044c:` : 
            `To'lov tasdiqlandi! Endi siz ${workerCount} ta ishchi ro'yxatini olishingiz mumkin.\n\nQanday mutaxassislar kerak? Iltimos, mutaxassislikni kiriting:`,
          {
            ...back_to_menu_keyboard[user?.telegramLanguage as keyof typeof back_to_menu_keyboard],
            parse_mode: "HTML",
          }
        );
      } else {
        const price = getPriceByWorkerCount(workerCount);
        const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        
        await ctx.reply(
          user.telegramLanguage === "ru" ? 
            `\u041e\u043f\u043b\u0430\u0442\u0430 \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u0430 \u0438\u043b\u0438 \u0435\u0449\u0435 \u043e\u043f\u043b\u0430\u0442\u0430 \u043d\u0435 \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043d\u0430. \u0414\u043b\u044f \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u0438\u044f ${workerCount} \u0440\u0430\u0431\u043e\u0442\u043d\u0438\u043a\u043e\u0432 \u043d\u0435\u043e\u0431\u0445\u043e\u0434\u0438\u043c\u043e \u043e\u043f\u043b\u0430\u0442\u0438\u0442\u044c ${formattedPrice} \u0441\u0443\u043c.` : 
            `To'lov topilmadi yoki hali tasdiqlanmagan. ${workerCount} ta ishchi ro'yxatini olish uchun ${formattedPrice} so'm to'lashingiz kerak.`,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: user.telegramLanguage === "ru" ? "\ud83d\udcb0 \u041e\u043f\u043b\u0430\u0442\u0438\u0442\u044c" : "\ud83d\udcb0 To'lov qilish",
                    callback_data: "make_payment"
                  }
                ],
                [
                  {
                    text: user.telegramLanguage === "ru" ? "\u2705 \u041f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0441\u043d\u043e\u0432\u0430" : "\u2705 Qayta tekshirish",
                    callback_data: "check_payment"
                  }
                ],
                [
                  {
                    text: user.telegramLanguage === "ru" ? "\ud83d\udd19 \u041d\u0430\u0437\u0430\u0434 \u0432 \u043c\u0435\u043d\u044e" : "\ud83d\udd19 Menyuga qaytish",
                    callback_data: "back-to-menu"
                  }
                ]
              ]
            }
          }
        );
      }
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in check_payment handler:', error);
      await ctx.reply(
        user.telegramLanguage === "ru" ? 
          "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0435 \u043e\u043f\u043b\u0430\u0442\u044b. \u041F\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435." : 
          "To'lovni tekshirishda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    }
  }
  
  else if (text === "back-to-menu") {
    // Reset steps and return to main menu
    await UsersService.update(chatId, { telegramStep: 14 });
    user = await UsersService.getUserByChatId(chatId);
    
    // Delete previous messages
    await deleteAllPreviousMessages(ctx, chatId);
    
    if (user.type === "enterprise") {
      await ctx.reply(
        contents.menu[user.telegramLanguage as keyof typeof contents.menu] || contents.menu.uz,
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    } else if (user.type === "worker") {
      await ctx.reply(
        contents.menu[user.telegramLanguage as keyof typeof contents.menu] || contents.menu.uz,
        {
          ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    }
    await ctx.answerCbQuery();
  }

  else if (text === "back_to_vacancy_list" && user?.type === "worker") {
    // Get current page from user session
    const page = user.currentPage || 1;
    const vacancyListString = user.vacancyList;
    
    if (vacancyListString) {
      const vacancies = JSON.parse(vacancyListString);
      
      // Calculate pagination with 6 vacancies per page
      const pageSize = 6;
      const totalPages = Math.ceil(vacancies.length / pageSize);
      const hasNext = page < totalPages;
      
      // Get vacancies for current page
      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, vacancies.length);
      const currentPageVacancies = vacancies.slice(startIndex, endIndex);
      
      // Create vacancy list message
      let vacancyListMessage = `<b>${contents.vacancyList[user?.telegramLanguage as keyof typeof contents.vacancyList] || "Vakansiyalar ro'yxati"}:</b>\n\n`;
      
      currentPageVacancies.forEach((vacancy: any, index: number) => {
        // Safely handle potentially null enterprise objects
        const enterprise = vacancy.enterprise || {};
        
        // Show only the first specialist or limit to a shorter preview
        const specialistPreview = vacancy.specialists && vacancy.specialists.length > 0 ? 
          (Array.isArray(vacancy.specialists) ? 
            (vacancy.specialists[0] + (vacancy.specialists.length > 1 ? "..." : "")) : 
            vacancy.specialists) : 
          "";
        
        // Always number from 1-6 on each page
        vacancyListMessage += `<b>${index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
      });
      
      vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${page}/${totalPages}\n`;
      vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
      vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;
      
      // Edit the current message instead of sending a new one
      await ctx.editMessageText(vacancyListMessage, {
        ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](page, hasNext, currentPageVacancies.length),
        parse_mode: "HTML",
      }).catch(error => {
        console.log("Could not edit message:", error);
        // If editing fails (e.g., message is too old), send a new message
        ctx.telegram.sendMessage(chatId, vacancyListMessage, {
          ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](page, hasNext, currentPageVacancies.length),
          parse_mode: "HTML",
        });
      });
    } else {
      await ctx.reply(
        contents.noVacanciesFound[user?.telegramLanguage as keyof typeof contents.noVacanciesFound] ||
        "Hozirda bo'sh ish o'rinlari mavjud emas.",
        {
          ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
          parse_mode: "HTML",
        });
    }
    
    await ctx.answerCbQuery();
  }
  
  // Handle pagination - next page button
  else if (text.startsWith("next_page_") && user?.type === "worker") {
    try {
      // Extract the page number from the callback data
      const nextPage = parseInt(text.replace("next_page_", ""));
      console.log("Moving to next page:", nextPage);
      
      // Get stored vacancies from user session
      const vacancyListString = user.vacancyList;
      if (!vacancyListString) {
        await ctx.answerCbQuery("Vakansiyalar ma'lumotlari topilmadi");
        return;
      }
      
      // Parse vacancies and update current page in user session
      const vacancies = JSON.parse(vacancyListString);
      await UsersService.update(chatId, { currentPage: nextPage });
      user = await UsersService.getUserByChatId(chatId); // Refresh user data with updated page
      
      // Calculate pagination with 6 vacancies per page
      const pageSize = 6;
      const totalPages = Math.ceil(vacancies.length / pageSize);
      const hasNext = nextPage < totalPages;
      
      // Get vacancies for current page - skip the appropriate number of vacancies based on page
      const startIndex = (nextPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, vacancies.length);
      const currentPageVacancies = vacancies.slice(startIndex, endIndex);
      
      // Create vacancy list message
      let vacancyListMessage = `<b>${contents.vacancyList[user?.telegramLanguage as keyof typeof contents.vacancyList] || "Vakansiyalar ro'yxati"}:</b>\n\n`;
      
      currentPageVacancies.forEach((vacancy: any, index: number) => {
        // Safely handle potentially null enterprise objects
        const enterprise = vacancy.enterprise || {};
        
        // Show only the first specialist or limit to a shorter preview
        const specialistPreview = vacancy.specialists && vacancy.specialists.length > 0 ? 
          (Array.isArray(vacancy.specialists) ? 
            (vacancy.specialists[0] + (vacancy.specialists.length > 1 ? "..." : "")) : 
            vacancy.specialists) : 
          "";
        
        // Compact format: always show as 1-6 on each page (not absolute position)
        vacancyListMessage += `<b>${index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
      });
      
      vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${nextPage}/${totalPages}\n`;
      vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
      vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;
      
      // Edit the current message instead of sending a new one
      await ctx.editMessageText(vacancyListMessage, {
        ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](nextPage, hasNext, currentPageVacancies.length),
        parse_mode: "HTML",
      }).catch(error => {
        console.log("Could not edit message:", error);
      });
      
      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling next page:", error);
      await ctx.answerCbQuery("Xatolik yuz berdi");
    }
  }
  
  // Handle pagination - previous page button
  else if (text.startsWith("prev_page_") && user?.type === "worker") {
    try {
      // Extract the page number from the callback data
      const prevPage = parseInt(text.replace("prev_page_", ""));
      console.log("Moving to previous page:", prevPage);
      
      // Get stored vacancies from user session
      const vacancyListString = user.vacancyList;
      if (!vacancyListString) {
        await ctx.answerCbQuery("Vakansiyalar ma'lumotlari topilmadi");
        return;
      }
      
      // Parse vacancies and update current page in user session
      const vacancies = JSON.parse(vacancyListString);
      await UsersService.update(chatId, { currentPage: prevPage });
      user = await UsersService.getUserByChatId(chatId); // Refresh user data with updated page
      
      // Calculate pagination with 6 vacancies per page
      const pageSize = 6;
      const totalPages = Math.ceil(vacancies.length / pageSize);
      const hasNext = prevPage < totalPages;
      
      // Get vacancies for current page - skip the appropriate number based on page
      const startIndex = (prevPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, vacancies.length);
      const currentPageVacancies = vacancies.slice(startIndex, endIndex);
      
      // Create vacancy list message
      let vacancyListMessage = `<b>${contents.vacancyList[user?.telegramLanguage as keyof typeof contents.vacancyList] || "Vakansiyalar ro'yxati"}:</b>\n\n`;
      
      currentPageVacancies.forEach((vacancy: any, index: number) => {
        // Safely handle potentially null enterprise objects
        const enterprise = vacancy.enterprise || {};
        
        // Show only the first specialist or limit to a shorter preview
        const specialistPreview = vacancy.specialists && vacancy.specialists.length > 0 ? 
          (Array.isArray(vacancy.specialists) ? 
            (vacancy.specialists[0] + (vacancy.specialists.length > 1 ? "..." : "")) : 
            vacancy.specialists) : 
          "";
        
        // Compact format: always show as 1-6 on each page (not absolute position)
        vacancyListMessage += `<b>${index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
      });
      
      vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${prevPage}/${totalPages}\n`;
      vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
      vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;
      
      // Edit the current message instead of sending a new one
      await ctx.editMessageText(vacancyListMessage, {
        ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](prevPage, hasNext, currentPageVacancies.length),
        parse_mode: "HTML",
      }).catch(error => {
        console.log("Could not edit message:", error);
      });
      
      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling previous page:", error);
      await ctx.answerCbQuery("Xatolik yuz berdi");
    }
  }
  
  // Handle the finish search button
  else if (text === "finish_search" && user?.type === "worker") {
    console.log("Finishing search and clearing vacancy data...");
    
    try {
      // Make sure to delete the vacancyList property completely
      // First update without the vacancyList property to ensure it's removed
      await UsersService.update(chatId, {
        telegramStep: 14,       // Return to main menu step
        currentPage: 1,         // Reset pagination
        vacancyList: ""         // Set to empty string first
      });
      
      // Second update to ensure vacancyList is completely reset
      await UsersService.update(chatId, {
        vacancyList: null
      });
      
      console.log(`Successfully cleared vacancy search data for user ${chatId}`);
    } catch (error) {
      console.error("Error clearing vacancy data:", error);
    }
    
    await deleteAllPreviousMessages(ctx, chatId);  // Clear all previous messages
    
    await ctx.reply(
      contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
      contents.menu.uz,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );
    await ctx.answerCbQuery();
  }
  // Handle location selections for residential address, working area, and enterprise address
  else if (text.startsWith("location_")) {
    const selectedLocation = text.replace("location_", "");
    
    if (user.type === "worker") {
      // For worker residential address input
      if (user.telegramStep === 6) {
        await WorkerService.update(user.id, { residentialAddress: selectedLocation });
        await UsersService.update(chatId, { telegramStep: 7 });
        
        await deleteAllPreviousMessages(ctx, chatId);
        
        await ctx.reply(
          contents.workingArea[user.telegramLanguage as keyof typeof contents.workingArea] ||
          contents.workingArea.uz,
          {
            ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
            parse_mode: "HTML",
          }
        );
      }
      // For worker working area input - no longer used, now handled by multiselect
      else if (user.telegramStep === 7) {
        // This case is kept for backward compatibility
        // We're using multi-select now
        await WorkerService.update(user.id, { workingArea: selectedLocation });
        await UsersService.update(chatId, { telegramStep: 8 });
        
        await deleteAllPreviousMessages(ctx, chatId);
        
        await ctx.reply(
          contents.passportSerialNumber[user.telegramLanguage as keyof typeof contents.passportSerialNumber] ||
          contents.passportSerialNumber.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      // For editing worker residential address
      else if (user.telegramStep === 18) {
        await WorkerService.update(user.id, { residentialAddress: selectedLocation });
        await UsersService.update(chatId, { telegramStep: 14 });
        
        await deleteAllPreviousMessages(ctx, chatId);
        
        await ctx.reply(
          contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          }
        );
      }
      // For editing worker working area - no longer used directly, now uses multiselect
      else if (user.telegramStep === 19) {
        await ctx.reply(
          contents.workingArea[user.telegramLanguage as keyof typeof contents.workingArea] ||
          contents.workingArea.uz,
          {
            ...location_keyboard[user?.telegramLanguage as keyof typeof location_keyboard],
            parse_mode: "HTML",
          }
        );
        return;
        
        // This is the old code, kept for reference but not executed
        // await WorkerService.update(user.id, { workingArea: selectedLocation });
        // await UsersService.update(chatId, { telegramStep: 14 });
        
        await deleteAllPreviousMessages(ctx, chatId);
        
        await ctx.reply(
          contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
            parse_mode: "HTML",
          }
        );
      }
    } else if (user.type === "enterprise") {
      // For enterprise address input during registration
      if (user.telegramStep === 5) {
        await EnterpriseService.update(user.id, { address: selectedLocation });
        await UsersService.update(chatId, { telegramStep: 6 });
        
        await deleteAllPreviousMessages(ctx, chatId);
        
        await ctx.reply(
          contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          }
        );
      }
      // For editing enterprise address
      else if (user.telegramStep === 16) {
        await EnterpriseService.update(user.id, { address: selectedLocation });
        await UsersService.update(chatId, { telegramStep: 6 });
        
        await deleteAllPreviousMessages(ctx, chatId);
        
        await ctx.reply(
          contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
          {
            ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
            parse_mode: "HTML",
          }
        );
      }
    }
    
    await ctx.answerCbQuery();
  }
  // Handle work selection for specialization and profession during registration
  else if (text.startsWith("select_work:") && user) {
    // Extract the work ID from the callback data
    const workId = text.replace("select_work:", "");
    console.log('Selected work ID:', workId);
    
    // Refresh user to ensure we have the latest data
    user = await UsersService.getUserByChatId(chatId);
    
    // Get the stored works and selected works from the user's session
    let worksListString = user.worksList || '[]';
    const selectedWorksString = user.selectedWorks || '[]';
    
    console.log('Works list string:', worksListString);
    console.log('Before update - Selected works string:', selectedWorksString);
    
    let worksList = [];
    try {
      worksList = JSON.parse(worksListString);
      console.log('Parsed worksList - length:', worksList.length);
      
      // CRITICAL FIX: If worksList is empty, fetch works from database
      if (worksList.length === 0) {
        console.log('WorksList is empty, fetching from database...');
        // Use the already imported WorkService from the top of the file
        const works = await WorkService.getAll();
        
        if (works && works.length > 0) {
          console.log(`Retrieved ${works.length} works from database`);
          worksList = works;
          
          // Update the worksList in the user's session
          const updatedWorksListString = JSON.stringify(worksList);
          await UsersService.update(chatId, { worksList: updatedWorksListString });
          worksListString = updatedWorksListString;
          console.log('Updated worksList in database');
        }
      }
      
      console.log('First few works:', worksList.slice(0, 3));
    } catch (error) {
      console.error('Error parsing worksList:', error);
    }
    
    let selectedWorks = [];
    try {
      selectedWorks = JSON.parse(selectedWorksString);
    } catch (error) {
      console.error('Error parsing selectedWorks:', error);
    }
    
    console.log('Before update - Parsed selected works:', selectedWorks);
    
    // Toggle selection status
    if (selectedWorks.includes(workId)) {
      // If already selected, remove it
      console.log('Removing work ID from selection');
      selectedWorks = selectedWorks.filter((id: string) => id !== workId);
    } else {
      // If not selected, add it
      console.log('Adding work ID to selection');
      selectedWorks.push(workId);
    }
    
    console.log('After update - Selected works array:', selectedWorks);
    
    // Convert to string for storage - ensure proper JSON format
    const updatedSelectedWorksString = JSON.stringify(selectedWorks);
    console.log('After update - Stringified selected works:', updatedSelectedWorksString);
    
    // Save the updated selected works AND ensure worksList is preserved
    await UsersService.update(chatId, { 
      selectedWorks: updatedSelectedWorksString,
      // Make sure to preserve the worksList - CRITICAL FIX
      worksList: worksListString 
    });
    
    // Verify update
    const updatedUser:any = await UsersService.getUserByChatId(chatId);
    if (updatedUser) {
      console.log('After database update - Selected works:', updatedUser.selectedWorks || '[]');
    } else {
      console.log('After database update - Failed to retrieve updated user');
    }
    
    // Get current page
    const page = user.worksPage || 1;
    
    // Generate updated keyboard with new selection state
    console.log('Generating keyboard with selected works:', selectedWorks);
    console.log('Number of works in worksList:', worksList.length);
    
    // Log a few works to confirm they have proper IDs
    if (worksList.length > 0) {
      console.log('Sample works:', worksList.slice(0, 2).map((w: any) => ({ id: w.id, name: w.name })));
    }
    
    const keyboard = generateWorkSelectionKeyboard(
      worksList,
      selectedWorks,
      user.telegramLanguage,
      page
    );
    
    // Log basic keyboard info
    if (keyboard.reply_markup && keyboard.reply_markup.inline_keyboard) {
      console.log('Keyboard generated with', keyboard.reply_markup.inline_keyboard.length, 'rows');
    }
    
    // Create the prompt message based on language
    const promptText = user.telegramLanguage === 'uz' 
      ? '🔍 Quyidagi mutaxasisliklardan birini yoki bir nechtasini tanlang:'
      : '🔍 Выберите одну или несколько специализаций из списка:';

    // Add instructions
    const instructionText = user.telegramLanguage === 'uz'
      ? '\nSiz bir nechta mutaxassislikni tanlashingiz mumkin.'
      : '\nВы можете выбрать несколько специализаций.';

    // Add confirmation instructions
    const confirmText = user.telegramLanguage === 'uz'
      ? '\nTanlashni yakunlash uchun "✅ Tasdiqlash" tugmasini bosing.'
      : '\nНажмите "✅ Подтвердить", чтобы завершить выбор.';

    // Create the message
    const message = `${promptText}${instructionText}${confirmText}`;
    
    // Update the message with new keyboard
    await ctx.editMessageText(message, keyboard);
    await ctx.answerCbQuery();
  }
  
  // Handle work pagination
  else if (text.startsWith("work_page:") && user) {
    // Extract the page number
    const page = parseInt(text.replace("work_page:", ""));
    console.log(`Changing to page ${page}`);
    
    // Get stored works and selected works
    let worksListString = user.worksList || '[]';
    const selectedWorksString = user.selectedWorks || '[]';
    
    let worksList = [];
    try {
      worksList = JSON.parse(worksListString);
      console.log(`Parsed worksList - found ${worksList.length} works`);
      
      // If worksList is empty or invalid, fetch fresh data from database
      if (!worksList || worksList.length === 0) {
        console.log('WorksList is empty when paginating, fetching from database...');
        const works = await WorkService.getAll();
        
        if (works && works.length > 0) {
          console.log(`Retrieved ${works.length} works from database during pagination`);
          worksList = works;
          
          // Update the worksList in the user session
          worksListString = JSON.stringify(worksList);
          await UsersService.update(chatId, { 
            worksList: worksListString,
            worksPage: page
          });
          console.log('Updated worksList in database during pagination');
        } else {
          console.error('No works found in database when trying to paginate');
        }
      } else {
        // Save just the current page
        await UsersService.update(chatId, { worksPage: page });
      }
    } catch (error) {
      console.error('Error handling pagination:', error);
      await ctx.answerCbQuery('Xatolik yuz berdi');
      return;
    }
    
    const selectedWorks = JSON.parse(selectedWorksString);
    
    // Generate updated keyboard for the new page
    console.log(`Generating keyboard for page ${page} with ${worksList.length} total works`);
    const keyboard = generateWorkSelectionKeyboard(
      worksList,
      selectedWorks,
      user.telegramLanguage,
      page
    );
    
    // Create the prompt message based on language
    const promptText = user.telegramLanguage === 'uz' 
      ? '🔍 Quyidagi mutaxasisliklardan birini yoki bir nechtasini tanlang:'
      : '🔍 Выберите одну или несколько специализаций из списка:';

    // Add instructions
    const instructionText = user.telegramLanguage === 'uz'
      ? '\nSiz bir nechta mutaxassislikni tanlashingiz mumkin.'
      : '\nВы можете выбрать несколько специализаций.';

    // Add confirmation instructions
    const confirmText = user.telegramLanguage === 'uz'
      ? '\nTanlashni yakunlash uchun "✅ Tasdiqlash" tugmasini bosing.'
      : '\nНажмите "✅ Подтвердить", чтобы завершить выбор.';

    // Create the message
    const message = `${promptText}${instructionText}${confirmText}`;
    
    // Update the message with new keyboard
    await ctx.editMessageText(message, keyboard);
    await ctx.answerCbQuery();
  }
  
  // Handle confirmation of selected works
  else if (text === "confirm_works" && user) {
    console.log('Confirm works button clicked');
    // Refresh user data to make sure we have the latest information
    user = await UsersService.getUserByChatId(chatId);
    
    // If we're in the work selection for worker search
    if (user.telegramStep === 28 && user.type === "enterprise") {
      console.log('Processing work selection confirmation for enterprise user');
      // Get selected works
      const selectedWorksString = user.selectedWorks || '[]';
      let selectedWorks = [];
      try {
        selectedWorks = JSON.parse(selectedWorksString);
        console.log('Selected works IDs:', selectedWorks);
      } catch (error) {
        console.error('Error parsing selectedWorks:', error);
      }
      
      // If no works selected, prompt user to select at least one
      if (selectedWorks.length === 0) {
        await ctx.reply(
          user.telegramLanguage === "ru" ? 
            "Пожалуйста, выберите хотя бы одно направление." : 
            "Iltimos, kamida bitta yo'nalishni tanlang."
        );
        await ctx.answerCbQuery();
        return;
      }
      
      // Fetch actual work data from database to ensure we have the latest data
      const works = await WorkService.getAll();
      console.log(`Retrieved ${works.length} works from database`);
      
      // Filter to get selected works
      const selectedWorkObjects = works.filter(work => 
        selectedWorks.includes(work.id)
      );
      console.log('Selected work objects:', selectedWorkObjects);
      
      // Show confirmation message with selected directions
      let selectedDirectionsText = '';
      if (selectedWorkObjects && selectedWorkObjects.length > 0) {
        selectedDirectionsText = selectedWorkObjects.map(work => `- ${work.name}`).join('\n');
        console.log('Selected directions text:', selectedDirectionsText);
      } else {
        console.log('No matching work objects found!');
      }
      
      // Save selected works and move to worker count selection
      await UsersService.update(chatId, { telegramStep: 30 });
      user = await UsersService.getUserByChatId(chatId);
      
      const confirmMessage = user.telegramLanguage === "ru" ? 
        `Вы выбрали следующие направления:\n${selectedDirectionsText}\n\nСколько работников вам нужно? Введите количество:` : 
        `Siz quyidagi yo'nalishlarni tanladingiz:\n${selectedDirectionsText}\n\nSizga nechta ishchi kerak? Sonni kiriting:`;
      
      // Update to the next step where we'll capture manual input for worker count
      await UsersService.update(chatId, { telegramStep: 30 });
      
      await ctx.reply(confirmMessage, {
        parse_mode: "HTML" as ParseMode,
      });
      
      await ctx.answerCbQuery();
      return;
    }
    
    console.log('User telegramStep:', user.telegramStep);
    console.log('User type:', user.type);
    
    // Get selected works
    const selectedWorksString = user.selectedWorks || '[]';
    const worksListString = user.worksList || '[]';
    
    console.log('Selected works string:', selectedWorksString);
    
    const selectedWorks = JSON.parse(selectedWorksString);
    const worksList = JSON.parse(worksListString);
    
    console.log('Parsed selected works:', selectedWorks);
    console.log('Selected works length:', selectedWorks.length);
    
    if (selectedWorks.length === 0) {
      console.log('No works selected, showing error message');
      await ctx.answerCbQuery("Please select at least one option");
      return;
    }
    
    // Filter the selected work objects
    const selectedWorkObjects = worksList.filter((work: any) => selectedWorks.includes(work.id));
    
    // Format the selected works as a string
    const worksString = selectedWorkObjects.map((work: any) => work.name).join(", ");
    
    console.log('Selected work objects:', selectedWorkObjects);
    console.log('Generated works string:', worksString);
    
    // Determine if this is for specialization or profession based on telegramStep
    console.log('Checking telegramStep conditions...');
    
    if (user.telegramStep === 8 && user.type === "worker") {
      console.log('Processing specialization selection (telegramStep 8)');
      
      // For specialization
      console.log('Updating telegramStep to 11...');
      await UsersService.update(chatId, { telegramStep: 11 });
      
      // Get the worker by user ID
      const worker = await WorkerService.getByUserId(user.id);
      console.log('Found worker:', worker?.id);
      
      if (worker) {
        // Extract the names of the selected works
        const workNames = selectedWorkObjects.map((work: any) => work.name);
        console.log('Work names to save:', workNames);
        
        // First try to update using MongoDB's native syntax
        console.log('Saving specialization as string:', worksString);
        
        try {
          // Try updating with the worker's ID first
          if (worker.id) {
            console.log('Updating worker with ID:', worker.id);
            await WorkerService.update(worker.id, { specialization: worksString });
            console.log('Worker updated successfully with worker.id');
          } else {
            // Fallback to using user.id if worker.id is not available
            console.log('Worker ID not found, using user.id:', user.id);
            await WorkerService.update(user.id, { specialization: worksString });
            console.log('Worker updated successfully with user.id');
          }
        } catch (error) {
          console.error('Error updating worker specialization:', error);
          // If the first attempt fails, try with user.id
          console.log('Trying alternative update with user.id');
          await WorkerService.update(user.id, { specialization: worksString });
        }
      } else {
        console.error('Worker not found for user ID:', user.id);
      }
      console.log('Updates completed for specialization');
      
      // Clear selection state
      await UsersService.update(chatId, { 
        selectedWorks: '[]',
        worksList: '[]',
        worksPage: 1
      });
      
      await deleteAllPreviousMessages(ctx, chatId);
      await ctx.reply(
        contents.experience[user.telegramLanguage as keyof typeof contents.experience] ||
        contents.experience.uz,
        {
          parse_mode: "HTML",
        }
      );

    }
    
    await ctx.answerCbQuery();
  }
  
  // Note: The multiselect location handler has been removed as requested
});

export default bot;
