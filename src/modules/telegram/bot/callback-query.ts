import { Composer, Context } from "telegraf";
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
  vacancy_pagination_keyboard
} from "./keyboards";
import { deleteAllPreviousMessages, isSubscribedToChannel, sendSubscriptionMessage } from "../utils/channel";
import contents from "../contents/contents";
import UsersService from "../../../modules/user/service";
import WorkerService from "../../../modules/worker/service";
import EnterpriseService from "../../../modules/enterprise/service";
import VacancyService from "../../../modules/vacancy/service";
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
  else if (text === "enterprise-edit-address" && user.type === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 16 });
    const enterprise = await EnterpriseService.getByUserId(user.id);

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.enterpriseAddress[user?.telegramLanguage as keyof typeof contents.enterpriseAddress] ||
      contents.enterpriseAddress.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "enterprise-edit-address" && user.type === "enterprise") {
    await UsersService.update(chatId, { telegramStep: 16 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.enterpriseTypeOfActivity[user?.telegramLanguage as keyof typeof contents.enterpriseTypeOfActivity] ||
      contents.enterpriseTypeOfActivity.uz,
      {
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

    await ctx.reply(contents.residentialAddress[user?.telegramLanguage as keyof typeof contents.residentialAddress] ||
      contents.residentialAddress.uz,
      {
        parse_mode: "HTML",
      });
    await ctx.answerCbQuery();
  }
  else if (text === "worker-edit-working-area" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 19 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.workingArea[user?.telegramLanguage as keyof typeof contents.workingArea] ||
      contents.workingArea.uz,
      {
        parse_mode: "HTML",
      });
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
  else if (text === "worker-edit-profession" && user.type === "worker") {
    await UsersService.update(chatId, { telegramStep: 22 });

    await deleteAllPreviousMessages(ctx, chatId);

    await ctx.reply(contents.profession[user?.telegramLanguage as keyof typeof contents.profession] ||
      contents.profession.uz,
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
    await UsersService.update(chatId, { telegramStep: 30 });

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
      const vacancyIndex = parseInt(text) - 1;
      
      // Check if vacancy exists at this index
      if (vacancyIndex < 0 || vacancyIndex >= vacancies.length) {
        await ctx.answerCbQuery("Tanlangan vakansiya mavjud emas");
        return;
      }
      
      const vacancy = vacancies[vacancyIndex];
      // Safely handle potentially null enterprise objects
      const enterprise = vacancy.enterprise || {};
      
      // Create detailed vacancy message with full specialists list and company information
      let detailedVacancyMessage = `<b>🏢 ${(enterprise && enterprise.name) || "Korxona"}</b>\n\n`;
      
      // Show full specialists list
      detailedVacancyMessage += `📋 <b>${contents.position[user?.telegramLanguage as keyof typeof contents.position] || "Lavozim"}:</b> ${vacancy.specialists.join(", ")}\n\n`;
      detailedVacancyMessage += `💰 <b>${contents.salary[user?.telegramLanguage as keyof typeof contents.salary] || "Maosh"}:</b> ${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}\n`;
      detailedVacancyMessage += `📍 <b>${contents.location[user?.telegramLanguage as keyof typeof contents.location] || "Manzil"}:</b> ${vacancy.area}\n\n`;
      
      // Add additional vacancy details
      if (vacancy.minimumExperience) {
        detailedVacancyMessage += `⏱ <b>${contents.vacancyMinimumExperience[user?.telegramLanguage as keyof typeof contents.vacancyMinimumExperience] || "Minimal tajriba"}:</b> ${vacancy.minimumExperience}\n`;
      }
      
      if (vacancy.opportunitiesForWorkers) {
        detailedVacancyMessage += `🌟 <b>${contents.vacancyOpportunitiesForWorkers[user?.telegramLanguage as keyof typeof contents.vacancyOpportunitiesForWorkers] || "Ishchilar uchun imkoniyatlar"}:</b> ${vacancy.opportunitiesForWorkers}\n\n`;
      }
      
      // Company contact information section
      detailedVacancyMessage += `<b>📞 Aloqa ma'lumotlari:</b>\n`;
      
      // Add enterprise contact info if available
      if (enterprise.user?.phoneNumber) {
        detailedVacancyMessage += `📱 <b>Telefon:</b> ${enterprise.user.phoneNumber}\n`;
      }
      
      if (enterprise.user?.username) {
        detailedVacancyMessage += `💬 <b>Telegram:</b> @${enterprise.user.username}\n`;
      } else if (enterprise.user?.fullName) {
        detailedVacancyMessage += `👤 <b>Mas'ul shaxs:</b> ${enterprise.user.fullName}\n`;
      }
      
      // Send the detailed vacancy information
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
  
  // Handle back button from vacancy details to list
  else if (text === "back_to_vacancy_list" && user?.type === "worker") {
    // Trigger the search again to show the list
    // We'll use the same handler that displays the vacancy list
    await ctx.deleteMessage();
    
    // Get current page from user session
    const page = user.currentPage || 1;
    const vacancyListString = user.vacancyList;
    
    if (vacancyListString) {
      const vacancies = JSON.parse(vacancyListString);
      
      // Calculate pagination
      const pageSize = 10;
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
          (vacancy.specialists[0] + (vacancy.specialists.length > 1 ? "..." : "")) : 
          "";
        
        // Compact format: number. company name - position (salary) location
        vacancyListMessage += `<b>${startIndex + index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
      });
      
      vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${page}/${totalPages}\n`;
      vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
      vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;
      
      // Send message with pagination keyboard
      await ctx.reply(vacancyListMessage, {
        ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](page, hasNext, currentPageVacancies.length),
        parse_mode: "HTML",
      });
    } else {
      await ctx.reply(
        contents.noVacanciesFound[user?.telegramLanguage as keyof typeof contents.noVacanciesFound] ||
        "Hozirda bo'sh ish o'rinlari mavjud emas.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
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
      
      // Parse vacancies and update current page
      const vacancies = JSON.parse(vacancyListString);
      await UsersService.update(chatId, { currentPage: nextPage });
      
      // Calculate pagination
      const pageSize = 10;
      const totalPages = Math.ceil(vacancies.length / pageSize);
      const hasNext = nextPage < totalPages;
      
      // Get vacancies for current page
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
          (vacancy.specialists[0] + (vacancy.specialists.length > 1 ? "..." : "")) : 
          "";
        
        // Compact format: number. company name - position (salary) location
        vacancyListMessage += `<b>${startIndex + index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
      });
      
      vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${nextPage}/${totalPages}\n`;
      vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
      vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;
      
      // First send the new message, then delete the old one to avoid message disappearing
      await ctx.reply(vacancyListMessage, {
        ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](nextPage, hasNext, currentPageVacancies.length),
        parse_mode: "HTML",
      });
      
      // Now it's safe to delete the original message
      try {
        await ctx.deleteMessage();
      } catch (deleteError) {
        console.error("Could not delete message:", deleteError);
        // Continue anyway since the new message is already sent
      }
      
      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling pagination:", error);
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
      
      // Parse vacancies and update current page
      const vacancies = JSON.parse(vacancyListString);
      await UsersService.update(chatId, { currentPage: prevPage });
      
      // Calculate pagination
      const pageSize = 10;
      const totalPages = Math.ceil(vacancies.length / pageSize);
      const hasNext = prevPage < totalPages;
      
      // Get vacancies for current page
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
          (vacancy.specialists[0] + (vacancy.specialists.length > 1 ? "..." : "")) : 
          "";
        
        // Compact format: number. company name - position (salary) location
        vacancyListMessage += `<b>${startIndex + index + 1}. ${(enterprise && enterprise.name) || "Korxona"}</b> - ${specialistPreview} (${vacancy.salary} ${contents.currencyUZS[user?.telegramLanguage as keyof typeof contents.currencyUZS] || "so'm"}) ${vacancy.area}\n\n`;
      });
      
      vacancyListMessage += `📄 ${contents.page[user?.telegramLanguage as keyof typeof contents.page] || "Sahifa"}: ${prevPage}/${totalPages}\n`;
      vacancyListMessage += `${contents.totalVacancies[user?.telegramLanguage as keyof typeof contents.totalVacancies] || "Jami vakansiyalar"}: ${vacancies.length}\n\n`;
      vacancyListMessage += `<b>${contents.selectVacancy[user?.telegramLanguage as keyof typeof contents.selectVacancy] || "To'liq ma'lumot olish uchun pastdagi raqamlardan birini bosing"}</b>`;
      
      // First send the new message, then delete the old one to avoid message disappearing
      await ctx.reply(vacancyListMessage, {
        ...vacancy_pagination_keyboard[user?.telegramLanguage as keyof typeof vacancy_pagination_keyboard](prevPage, hasNext, currentPageVacancies.length),
        parse_mode: "HTML",
      });
      
      // Now it's safe to delete the original message
      try {
        await ctx.deleteMessage();
      } catch (deleteError) {
        console.error("Could not delete message:", deleteError);
        // Continue anyway since the new message is already sent
      }
      
      await ctx.answerCbQuery();
    } catch (error) {
      console.error("Error handling pagination:", error);
      await ctx.answerCbQuery("Xatolik yuz berdi");
    }
  }
  
  // Handle the finish search button
  else if (text === "finish_search" && user?.type === "worker") {
    await ctx.deleteMessage();
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
});

export default bot;
