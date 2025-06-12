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
  location_keyboard,
  vacancy_type_keyboard
} from "./keyboards";
import { generateWorkSelectionKeyboard, formatSelectedWorksMessage } from "./multiselect-keyboard";
import { generateLocationMultiselectKeyboard, formatSelectedLocationsMessage, allLocations } from "./location-multiselect";
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
import { writeWorkerToSheet } from "../../../utils/googleSheet";
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
    const worker: any = await WorkerService.getByUserId(user.id);
    const googleSheetData = {
      fullName: worker.fullName,
      birthDate: worker.birthDate,
      gender: worker?.gender,
      residentialAddress: worker.residentialAddress,
      workingArea: worker.workingArea,
      passportSerialNumber: worker.passportSerialNumber,
      specialization: worker.specialization,
      experience: worker.experience,
      minimumWage: worker.minimumWage,
      phoneNumber: user.phoneNumber,
      additionalSkills: worker.additionalSkills,
      _id: worker._id,
      createdAt: worker.createdAt,
    }

    await writeWorkerToSheet([googleSheetData]);

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
    // First ask for vacancy type instead of directly creating the vacancy
    await UsersService.update(chatId, { telegramStep: 6 }); // Using step 6 for vacancy type selection

    await deleteAllPreviousMessages(ctx, chatId);

    // Display vacancy type selection prompt
    const language = user?.telegramLanguage as keyof typeof contents.vacancyType || "uz";
    await ctx.reply(
      contents.vacancyType[language] || contents.vacancyType.uz,
      { parse_mode: "HTML", reply_markup: vacancy_type_keyboard[language]?.reply_markup || vacancy_type_keyboard.uz.reply_markup }
    );
    await ctx.answerCbQuery();
  }
  // Handle vacancy type selection
  else if ((text === "vacancy-type-work" || text === "vacancy-type-student") && user.type === "enterprise" && user.telegramStep === 6) {
    await UsersService.update(chatId, { telegramStep: 7 });

    const enterprise = await EnterpriseService.getByUserId(user.id);
    // Create vacancy with the selected type
    const vacancyType = text === "vacancy-type-work" ? "work" : "student";
    const vacancy = await VacancyService.create({ enterprise, type: vacancyType });

    // Store the current vacancy id in the user session for the next step
    await UsersService.update(chatId, { currentVacancyId: vacancy.id });

    await deleteAllPreviousMessages(ctx, chatId);

    // Fetch all works
    const works = await WorkService.getAll();
    // Create inline keyboard for works, only send work id in callback_data
    const workButtons = works.map((work: any) => [{
      text: work.name,
      callback_data: `vacsel:${work.id}`
    }]);

    await ctx.reply(
      contents.vacancySpecialists[user?.telegramLanguage as keyof typeof contents.vacancySpecialists] ||
      contents.vacancySpecialists.uz,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: workButtons
        }
      }
    );
    await ctx.answerCbQuery();
  }
  // Handle work selection for vacancy
  else if (text.startsWith("vacsel:") && user.type === "enterprise" && user.telegramStep === 7) {
    // Get workId from callback_data and vacancyId from user session
    const workId = text.split(":")[1];
    const vacancyId = user.currentVacancyId;
    if (vacancyId && workId) {
      const work = await WorkService.getById(workId);
      await VacancyService.update(vacancyId, { specialist: work?.name });
      await UsersService.update(chatId, { telegramStep: 8, currentVacancyId: vacancyId });

      await deleteAllPreviousMessages(ctx, chatId);

      // Show region selection (viloyatlar) as inline buttons
      const regionButtons = allLocations.map((loc: any) => [{
        text: user.telegramLanguage === "ru" ? loc.nameRu : loc.name,
        callback_data: `vacancy-region:${loc.id}`
      }]);

      await ctx.reply(
        user.telegramLanguage === "ru"
          ? "Ish joylashgan hududni tanlang:"
          : "Ish qaysi hududda joylashganini tanlang:",
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: regionButtons
          }
        }
      );
    } else {
      await ctx.reply("Xatolik: vacancy yoki work aniqlanmadi.");
    }
    await ctx.answerCbQuery();
  }
  // Handle region selection for vacancy
  else if (text.startsWith("vacancy-region:") && user.type === "enterprise" && user.telegramStep === 8) {
    const regionId = text.split(":")[1];
    const vacancyId = user.currentVacancyId;
    if (vacancyId && regionId) {
      await VacancyService.update(vacancyId, { area: regionId });
      await UsersService.update(chatId, { telegramStep: 9, currentVacancyId: null });

      await deleteAllPreviousMessages(ctx, chatId);

      await ctx.reply(
        contents.vacancyMinimumExperience[user.telegramLanguage as keyof typeof contents.vacancyMinimumExperience] ||
        contents.vacancyMinimumExperience.uz,
        {
          parse_mode: "HTML",
        });
    } else {
      await ctx.reply("Xatolik: vacancy yoki hudud aniqlanmadi.");
    }
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
  // Apprentice question handler - Yes
  else if (text === "yes" && user.type === "worker" && user.telegramStep === 25) {
    // Mark user as willing to be apprentice and show works selection
    await UsersService.update(chatId, { telegramStep: 27 }); // Using step 27 for works selection
    await WorkerService.update(user.id, { is_student: true });

    // Get all the available works from the database
    const works = await WorkService.getAll();
    const availableWorks = works.map(work => ({
      id: work._id,
      name: work.name // Using the name directly as it's a string
    }));

    // Save works list in user session for pagination
    await UsersService.update(chatId, {
      worksList: JSON.stringify(availableWorks),
      worksPage: 1,
      selectedWorks: '[]'
    });

    await deleteAllPreviousMessages(ctx, chatId);

    // Ask user to select works they are interested in
    await ctx.reply(
      contents.selectStudentWorks[user.telegramLanguage as keyof typeof contents.selectStudentWorks] ||
      contents.selectStudentWorks.uz,
      {
        reply_markup: generateWorkSelectionKeyboard(availableWorks, [], user.telegramLanguage).reply_markup,
        parse_mode: "HTML" as ParseMode,
      }
    );

    await ctx.answerCbQuery();
  }

  // Handle work selection for apprentices
  else if (text === "confirm_works" && user.type === "worker" && user.telegramStep === 27) {
    console.log('Confirming apprentice works selection');
    // Retrieve the selected works from user data
    const selectedWorks = user.selectedWorks ? JSON.parse(user.selectedWorks) : [];

    if (!selectedWorks || selectedWorks.length === 0) {
      // If nothing selected, we can inform the user
      await ctx.answerCbQuery(
        user.telegramLanguage === "ru" ?
          "Пожалуйста, выберите хотя бы одну работу" :
          "Iltimos, kamida bitta ishni tanlang"
      );
      return;
    }

    // Get work details to store names as well
    const works = await WorkService.getAll();
    const selectedWorkDetails = works
      .filter(work => selectedWorks.includes(work._id))
      .map(work => work._id);

    // Save the selected works to the worker record
    await WorkerService.update(user.id, { studentWorks: selectedWorkDetails });

    // Go directly to main menu (telegramStep 14) instead of asking for minimum wage again
    await UsersService.update(chatId, { telegramStep: 14 });

    // Delete ALL previous messages, not just keyboard messages
    await deleteAllPreviousMessages(ctx, chatId, undefined, false);

    // Show successful registration message and display menu
    const successMsg = user.telegramLanguage === "ru" ?
      "✅ Регистрация успешно завершена! Выберите нужный раздел:" :
      "✅ Registratsiyadan muvaffaqiyatli o'tdingiz! Kerakli bo'limni tanlang:";

      const worker: any = await WorkerService.getByUserId(user.id);
    const googleSheetData = {
      fullName: worker.fullName,
      birthDate: worker.birthDate,
      gender: worker?.gender,
      residentialAddress: worker.residentialAddress,
      workingArea: worker.workingArea,
      passportSerialNumber: worker.passportSerialNumber,
      specialization: worker.specialization,
      experience: worker.experience,
      minimumWage: worker.minimumWage,
      phoneNumber: user.phoneNumber,
      additionalSkills: worker.additionalSkills,
      _id: worker._id,
      createdAt: worker.createdAt,
    }

    await writeWorkerToSheet([googleSheetData]);

    await ctx.reply(
      successMsg,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );

    await ctx.answerCbQuery();
  }

  // Apprentice question handler - No
  else if (text === "no" && user.type === "worker" && user.telegramStep === 25) {
    // Mark user as not willing to be apprentice and complete registration
    await UsersService.update(chatId, { telegramStep: 14 }); // Set to completed registration step
    await WorkerService.update(user.id, { is_student: false });

    await deleteAllPreviousMessages(ctx, chatId);

    // Show registration success message
    const successMsg = user.telegramLanguage === "ru" ?
      "✅ Регистрация успешно завершена! Выберите нужный раздел:" :
      "✅ Registratsiyadan muvaffaqiyatli o'tdingiz! Kerakli bo'limni tanlang:";

      const worker: any = await WorkerService.getByUserId(user.id);
    const googleSheetData = {
      fullName: worker.fullName,
      birthDate: worker.birthDate,
      gender: worker?.gender,
      residentialAddress: worker.residentialAddress,
      workingArea: worker.workingArea,
      passportSerialNumber: worker.passportSerialNumber,
      specialization: worker.specialization,
      experience: worker.experience,
      minimumWage: worker.minimumWage,
      phoneNumber: user.phoneNumber,
      additionalSkills: worker.additionalSkills,
      _id: worker._id,
      createdAt: worker.createdAt,
    }

    await writeWorkerToSheet([googleSheetData]);

    // Show main menu
    await ctx.reply(
      successMsg,
      {
        ...worker_menu_keyboard[user?.telegramLanguage as keyof typeof worker_menu_keyboard],
        parse_mode: "HTML",
      }
    );

    await ctx.answerCbQuery();
  }

  // Existing handler for residency question (now unused in main flow but kept for completeness)
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
  // WORKER SEARCH WORK ---------------------------
  else if (text === "search-work" && user.type === "worker") {
    // Get worker profile to check if they are an apprentice
    const worker = await WorkerService.getByUserId(user.id);

    // Reset basic search parameters
    const updateParams: any = {
      vacancyList: null,  // Clear old vacancy list data
      currentPage: 1      // Reset pagination to first page
    };

    await deleteAllPreviousMessages(ctx, chatId, undefined, false);  // Clear previous messages

    // If worker is an apprentice (is_student=true), show work type selection
    if (worker && worker.is_student) {
      // Set telegram step for work type selection
      updateParams.telegramStep = 29;
      await UsersService.update(chatId, updateParams);

      // Create inline keyboard with two options: regular work or apprentice work
      const workTypeKeyboard = {
        parse_mode: "HTML" as ParseMode,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: contents.workTypeJob[user.telegramLanguage as keyof typeof contents.workTypeJob] || contents.workTypeJob.uz,
                callback_data: "search-regular-work"
              },
              {
                text: contents.workTypeApprentice[user.telegramLanguage as keyof typeof contents.workTypeApprentice] || contents.workTypeApprentice.uz,
                callback_data: "search-apprentice-work"
              }
            ]
          ]
        }
      };

      // Show work type selection menu
      await ctx.reply(
        contents.searchWorkType[user.telegramLanguage as keyof typeof contents.searchWorkType] ||
        contents.searchWorkType.uz,
        workTypeKeyboard
      );
    } else {
      // Not an apprentice, directly proceed to regular work search
      updateParams.telegramStep = 30;
      await UsersService.update(chatId, updateParams);

      // Show regular work search prompt
      await ctx.reply(
        contents.searchWork[user.telegramLanguage as keyof typeof contents.searchWork] ||
        contents.searchWork.uz,
        {
          parse_mode: "HTML",
        }
      );
    }
  }

  // Handle regular work search
  else if (text === "search-regular-work" && user.type === "worker" && user.telegramStep === 29) {
    // Update to regular work search step
    await UsersService.update(chatId, {
      telegramStep: 30,
      vacancySearchType: "work" // Set search type to regular work
    });

    await deleteAllPreviousMessages(ctx, chatId, undefined, false);

    // Show work search prompt
    await ctx.reply(
      contents.searchWork[user.telegramLanguage as keyof typeof contents.searchWork] ||
      contents.searchWork.uz,
      {
        parse_mode: "HTML",
      }
    );
  }

  // Handle apprentice work search
  else if (text === "search-apprentice-work" && user.type === "worker" && user.telegramStep === 29) {
    // Update to apprentice work search step
    await UsersService.update(chatId, {
      telegramStep: 30,
      vacancySearchType: "student" // Set search type to apprentice work
    });

    await deleteAllPreviousMessages(ctx, chatId, undefined, false);

    // Show work search prompt
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
        console.log(`Vacancy not found: index ${vacancyIndex} is out of range (0-${vacancies.length - 1})`);
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

      // First step: Ask to select worker type (regular or apprentice)
      await UsersService.update(chatId, { telegramStep: 27 }); // Step for worker type selection

      // Create worker type selection keyboard
      const workerTypeKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: contents.workerTypeRegular[user?.telegramLanguage as keyof typeof contents.workerTypeRegular] || "💼 Ishchi",
                callback_data: "search-regular-worker"
              },
              {
                text: contents.workerTypeApprentice[user?.telegramLanguage as keyof typeof contents.workerTypeApprentice] || "🧠 Shogirt",
                callback_data: "search-apprentice-worker"
              }
            ]
          ]
        }
      };

      // Display message asking to select worker type
      await ctx.reply(
        contents.searchWorkerType[user?.telegramLanguage as keyof typeof contents.searchWorkerType] || "Qanaqa turdagi ishchini qidirmoqchisiz?",
        {
          ...workerTypeKeyboard,
          parse_mode: "HTML",
        }
      );

      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in search-worker handler:', error);
      await ctx.reply(
        user?.telegramLanguage === "ru" ? "Произошла ошибка." : "Xatolik yuz berdi.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    }
  }

  // Handle apprentice worker search selection
  else if (text === "search-apprentice-worker" && user?.type === "enterprise") {
    try {
      // Set worker search type to student/apprentice
      await UsersService.update(chatId, { workerSearchType: "student", telegramStep: 28 }); // Step for work direction selection
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
        parse_mode: "HTML",
      });

      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in search-apprentice-worker handler:', error);
      await ctx.reply(
        user?.telegramLanguage === "ru" ? "Произошла ошибка." : "Xatolik yuz berdi.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    }
  }

  // Handle regular worker search selection
  else if (text === "search-regular-worker" && user?.type === "enterprise") {
    try {
      // Set worker search type to regular
      await UsersService.update(chatId, { workerSearchType: "regular", telegramStep: 28 }); // Step for work direction selection
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

      await UsersService.update(chatId, {
        telegramStep: 31,
        selectedReceiptId: paymentUrl.id
      });

      // Send payment link to the user
      await ctx.reply(
        user.telegramLanguage === "ru" ?
          `Для получения списка ${workerCount} работников оплатите ${formattedPrice} сум по ссылке:\n${paymentUrl.url}\n\nПосле оплаты нажмите «Проверить оплату».` :
          `${workerCount} ta ishchi ro'yxatini olish uchun ${formattedPrice} so'mni quyidagi havola orqali to'lang:\n${paymentUrl.url}\n\nTo'lovdan so'ng "To'lovni tekshirish" tugmasini bosing.`,
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
      const workerCount = user.workerCount || 1;

      if (user.selectedReceiptId) {
        const receipt = await ReceiptService.getReceiptById({ receiptId: user.selectedReceiptId });
        if (!receipt) {
          await ctx.reply(
            user.telegramLanguage === "ru" ?
              "Ошибка при проверке оплаты. Пожалуйста, попробуйте позже." :
              "To'lovni tekshirishda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
            {
              ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
              parse_mode: "HTML",
            }
          );
          return;
        }
        if (receipt.status !== 'paid') {
          await ctx.reply(
            user.telegramLanguage === "ru" ?
              "Ошибка при проверке оплаты. Пожалуйста, попробуйте позже." :
              "To'lovni tastiqlanmadi",
            {
              ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
              parse_mode: "HTML",
            }
          );
          return;
        }

        user = await UsersService.getUserByChatId(chatId);

        // Send initial confirmation message
        await ctx.reply(
          user.telegramLanguage === "ru" ?
            `Оплата подтверждена! Генерируем список ${workerCount} работников...` :
            `To'lov tasdiqlandi! ${workerCount} ta ishchi ro'yxati tayyorlanmoqda...`
        );

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

          // Mark the receipt as used after successful worker search
          if (receipt) {
            // Update receipt to mark it as used
            await ReceiptService.updateReceipt({
              receiptId: receipt.id,
              receipt: receipt,
              amount: receipt.amount,
              method: receipt.method as string,
              platform: receipt.platform as string,
              isUsed: true
            });

            console.log(`Marked receipt ${receipt.id} as used after worker search for user ${user.id}`);

            // Clear the saved receipt ID after using it
            await UsersService.update(chatId, { selectedReceiptId: null });
          }

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
      } else {
        const price = getPriceByWorkerCount(workerCount);
        const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        await ctx.reply(
          user.telegramLanguage === "ru" ?
            `Оплата не найдена или еще не подтверждена. Для получения ${workerCount} работников необходимо оплатить ${formattedPrice} сум.` :
            `To'lov topilmadi yoki hali tasdiqlanmagan. ${workerCount} ta ishchi ro'yxatini olish uchun ${formattedPrice} so'm to'lashingiz kerak.`,
          {
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
          }
        );
      }
      await ctx.answerCbQuery();
    } catch (error) {
      console.error('Error in check_payment handler:', error);
      await ctx.reply(
        user.telegramLanguage === "ru" ?
          "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u043f\u0440\u043e\u0432\u0435\u0440\u043a\u0435 \u043e\u043f\u043b\u0430\u0442\u044b. \u041f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435." :
          "To'lovni tekshirishda xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.",
        {
          ...enterprise_menu_keyboard[user?.telegramLanguage as keyof typeof enterprise_menu_keyboard],
          parse_mode: "HTML",
        }
      );
    }
  }

  else if (text === "back-to-menu") {
    await UsersService.update(chatId, { telegramStep: 14 });
    user = await UsersService.getUserByChatId(chatId);

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
    const page = user.currentPage || 1;
    const vacancyListString = user.vacancyList;

    if (vacancyListString) {
      const vacancies = JSON.parse(vacancyListString);

      const pageSize = 6;
      const totalPages = Math.ceil(vacancies.length / pageSize);
      const hasNext = page < totalPages;

      const startIndex = (page - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, vacancies.length);
      const currentPageVacancies = vacancies.slice(startIndex, endIndex);

      let vacancyListMessage = `<b>${contents.vacancyList[user?.telegramLanguage as keyof typeof contents.vacancyList] || "Vakansiyalar ro'yxati"}:</b>\n\n`;

      currentPageVacancies.forEach((vacancy: any, index: number) => {
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
  // Handle multiselect location for working area
  else if (text.startsWith("multiselect_location:")) {
    if (!user) return;

    const locationId = text.replace("multiselect_location:", "");

    // Get current worker data to ensure we have the latest state
    const worker = await WorkerService.getByUserId(user.id);

    // Get currently selected working areas
    let selectedAreas: string[] = [];
    try {
      // If already has working areas, parse them
      if (worker?.workingArea) {
        // Check if it's already an array in string format
        if (worker.workingArea.startsWith('[') && worker.workingArea.endsWith(']')) {
          selectedAreas = JSON.parse(worker.workingArea);
        } else {
          // Single value, convert to array
          selectedAreas = [worker.workingArea];
        }
      }
    } catch (error) {
      console.error('Error parsing working areas:', error);
    }

    console.log('Current selected areas before toggle:', selectedAreas);

    // Toggle selection
    if (selectedAreas.includes(locationId)) {
      selectedAreas = selectedAreas.filter(id => id !== locationId);
    } else {
      selectedAreas.push(locationId);
    }

    console.log('Selected areas after toggle:', selectedAreas);

    // Keep track of selected areas in worker object
    const areaString = JSON.stringify(selectedAreas);
    await WorkerService.update(user.id, { workingArea: areaString });

    // Show updated selection keyboard
    await ctx.editMessageText(
      formatSelectedLocationsMessage(selectedAreas, user.telegramLanguage),
      generateLocationMultiselectKeyboard(selectedAreas, user.telegramLanguage)
    );

    // Log for debugging
    console.log(`Updated worker ${user.id} working area to: ${areaString}`);
  }

  // Handle completion of location multiselect for working area
  else if (text === "locations_done") {
    if (!user) return;

    // Get current worker data to ensure we have the latest state
    const worker = await WorkerService.getByUserId(user.id);

    let selectedAreas: string[] = [];
    try {
      // Parse selected areas from worker object
      if (worker?.workingArea) {
        if (worker.workingArea.startsWith('[') && worker.workingArea.endsWith(']')) {
          selectedAreas = JSON.parse(worker.workingArea);
        } else {
          selectedAreas = [worker.workingArea];
        }
      }
    } catch (error) {
      console.error('Error parsing working areas:', error);
    }

    console.log('Selected areas for completion:', selectedAreas);

    // If no areas selected, show error message
    if (selectedAreas.length === 0) {
      await ctx.answerCbQuery(
        user.telegramLanguage === "ru"
          ? "Пожалуйста, выберите хотя бы одну область"
          : "Iltimos, kamida bitta hududni tanlang",
        { show_alert: true }
      );
      return;
    }

    // Move to next step
    await UsersService.update(chatId, { telegramStep: 8 });
    await deleteAllPreviousMessages(ctx, chatId);

    // Show next question
    await ctx.reply(
      contents.passportSerialNumber[user.telegramLanguage as keyof typeof contents.passportSerialNumber] ||
      contents.passportSerialNumber.uz,
      {
        parse_mode: "HTML",
      }
    );
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
          generateLocationMultiselectKeyboard([], user.telegramLanguage)
        );
      }
      // For worker working area input - legacy option kept for backward compatibility
      // The main implementation now uses multiselect_location and locations_done
      else if (user.telegramStep === 7) {
        // Get current worker data to ensure we have the latest state
        const worker = await WorkerService.getByUserId(user.id);

        // Get any existing areas or initialize with the selected one
        let initialAreas: string[] = [];
        try {
          if (worker?.workingArea && worker.workingArea.startsWith('[') && worker.workingArea.endsWith(']')) {
            // Parse existing areas if they're in JSON array format
            initialAreas = JSON.parse(worker.workingArea);
            // Add the newly selected area if it's not already there
            if (!initialAreas.includes(selectedLocation)) {
              initialAreas.push(selectedLocation);
            }
          } else {
            // Initialize with a single location as array
            initialAreas = [selectedLocation];
          }
        } catch (error) {
          console.error('Error parsing existing working areas:', error);
          // Fallback to just the newly selected area
          initialAreas = [selectedLocation];
        }

        // Save updated working area array
        await WorkerService.update(user.id, { workingArea: JSON.stringify(initialAreas) });

        // Instead of proceeding, show multi-select

        await deleteAllPreviousMessages(ctx, chatId);

        // Show multiselect interface
        await ctx.reply(
          formatSelectedLocationsMessage(initialAreas, user.telegramLanguage),
          generateLocationMultiselectKeyboard(initialAreas, user.telegramLanguage)
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
      // For editing worker working area - now using multiselect
      else if (user.telegramStep === 19) {
        const worker = await WorkerService.getByUserId(user.id);

        // Get current working areas if any
        let currentAreas: string[] = [];
        try {
          if (worker?.workingArea) {
            if (worker.workingArea.startsWith('[') && worker.workingArea.endsWith(']')) {
              currentAreas = JSON.parse(worker.workingArea);
            } else {
              currentAreas = [worker.workingArea];
            }
          }
        } catch (error) {
          console.error('Error parsing working areas for edit:', error);
        }

        // Show multi-select interface with current areas pre-selected
        await ctx.reply(
          formatSelectedLocationsMessage(currentAreas, user.telegramLanguage),
          generateLocationMultiselectKeyboard(currentAreas, user.telegramLanguage)
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
    const updatedUser: any = await UsersService.getUserByChatId(chatId);
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
      const selectedWorks = user.selectedWorks ? JSON.parse(user.selectedWorks) : [];

      // If no works selected, prompt user to select at least one
      if (!selectedWorks || selectedWorks.length === 0) {
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
    const selectedWorkObjects = await WorkService.getByIds(selectedWorks);

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
            await WorkerService.update(user.id, { specialization: workNames });
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
});

export default bot;
