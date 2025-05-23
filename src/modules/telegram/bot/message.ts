import { Composer, Context } from "telegraf";
import contents from "../contents/contents";
import { gender_keyboard, worker_menu_keyboard, language_keyboard, vote_keyboard, enterprise_menu_keyboard, vacancy_pagination_keyboard } from "./keyboards";
import UsersService from "../../../modules/user/service";
import { deleteAllPreviousMessages, isSubscribedToChannel, sendSubscriptionMessage } from "../utils/channel";
import WorkerService from "../../../modules/worker/service";
import EnterpriseService from "../../../modules/enterprise/service";
import VacancyService from "../../../modules/vacancy/service";
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
        await UsersService.update(chatId, { telegramStep: 9 });
        await WorkerService.update(user.id, { passportSerialNumber: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.specialization[user.telegramLanguage as keyof typeof contents.specialization] ||
          contents.specialization.uz,
          {
            parse_mode: "HTML",
          }
        );
      }
      if (user && user.telegramStep === 9 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 10 });
        await WorkerService.update(user.id, { specialization: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.profession[user.telegramLanguage as keyof typeof contents.profession] ||
          contents.profession.uz,
          {
            parse_mode: "HTML",
          }
        );
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
        await UsersService.update(chatId, { telegramStep: 14 });
        await WorkerService.update(user.id, { minimumWage: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.workInACityOtherThanTheResidentialAddress[user.telegramLanguage as keyof typeof contents.workInACityOtherThanTheResidentialAddress] ||
          contents.workInACityOtherThanTheResidentialAddress.uz,
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
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 5 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 6 });
        await EnterpriseService.update(user.id, { address: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.menu[user.telegramLanguage as keyof typeof contents.menu] ||
          contents.menu.uz,
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
        console.log(`Enterprise:`,enterprise);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        console.log(`Vacancy:`,vacancy);
        await VacancyService.update(vacancy?.id, { specialists: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.vacancyArea[user.telegramLanguage as keyof typeof contents.vacancyArea] ||
          contents.vacancyArea.uz,
          {
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 8 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 9 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await VacancyService.update(vacancy?.id, { area: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.vacancyMinimumExperience[user.telegramLanguage as keyof typeof contents.vacancyMinimumExperience] ||
          contents.vacancyMinimumExperience.uz,
          {
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 9 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 10 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await VacancyService.update(vacancy?.id, { minimumExperience: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.vacancyOpportunitiesForWorkers[user.telegramLanguage as keyof typeof contents.vacancyOpportunitiesForWorkers] ||
          contents.vacancyOpportunitiesForWorkers.uz,
          {
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 10 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 11 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await VacancyService.update(vacancy?.id, { opportunitiesForWorkers: text });
        await deleteAllPreviousMessages(ctx, chatId);
        await ctx.reply(
          contents.vacancySalary[user.telegramLanguage as keyof typeof contents.vacancySalary] ||
          contents.vacancySalary.uz,
          {
            parse_mode: "HTML",
          });
      }
      if (user && user.telegramStep === 11 && user.type === "enterprise") {
        await UsersService.update(chatId, { telegramStep: 12 });
        const enterprise = await EnterpriseService.getByUserId(user.id);
        const vacancy = await VacancyService.getDraftVacancyByEnterpriseId(enterprise?.id);
        await VacancyService.update(vacancy?.id, { salary: text });
        await deleteAllPreviousMessages(ctx, chatId);
        if (user.telegramLanguage === "uz") {
          const vacancyText = `
Bosh ish o'rni: ${vacancy?.specialists}
Murojaat qilish uchun telegram: ${user.username}
Murojaat qilish uchun telefon: ${user.phoneNumber}
Ishlash joyi: ${vacancy?.area}
Mas'ul shaxs: ${user?.fullName}
Oylik boshlang'ich: ${vacancy?.salary}
Qo'shimcha ma'lumotlar: ${vacancy?.opportunitiesForWorkers}

Hamma malumotlar to'g'rimi?
        `
          await ctx.reply(vacancyText, {
            ...vote_keyboard[user?.telegramLanguage as keyof typeof vote_keyboard],
            parse_mode: "HTML",
          });
        }
        if (user.telegramLanguage === "ru") {
          const vacancyText = `
Основная должность: ${vacancy?.specialists}
Телеграмма для заявки: ${user.username}
Телефон для заявки: ${user.phoneNumber}
Место работы: ${vacancy?.area}
Менеджер: ${user?.fullName}
Дополнительная информация: ${vacancy?.opportunitiesForWorkers}
Начальная зарплата: ${vacancy?.salary}

Все данные верны?
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
          });
      }
      // WORKER EDIT INFO END ---------------------------

      // WORKER SEARCH WORK ---------------------------
      if (user && user.telegramStep === 30 && user.type === "worker") {
        await UsersService.update(chatId, { telegramStep: 14 });
        // Save current page in user state
        await UsersService.update(chatId, { currentPage: 1 });
        await deleteAllPreviousMessages(ctx, chatId);
        
        // Get all active vacancies
        const vacancies = await VacancyService.getAllActiveVacancies(text);
        
        // If no vacancies are available
        if (!vacancies || vacancies.length === 0) {
          await ctx.reply(
            contents.noVacanciesFound[user?.telegramLanguage as keyof typeof contents.noVacanciesFound] ||
            "Hozirda bo'sh ish o'rinlari mavjud emas.",
            {
              parse_mode: "HTML",
            });
          return;
        }
        
        // Store vacancies in user session
        await UsersService.update(chatId, { vacancyList: JSON.stringify(vacancies) });
        
        // Calculate pagination
        const pageSize = 10;
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
