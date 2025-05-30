import { configurations } from "../../../config/index";

export const subscription_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "📢 Kanalga obuna bo'lish",
                        url: configurations.telegram.channelLink,
                    },
                ],
                [
                    {
                        text: "✅ Tekshirish",
                        callback_data: "check_subscription",
                    },
                ],
            ],
        },
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "📢 Подписаться на канал",
                        url: configurations.telegram.channelLink,
                    },
                ],
                [
                    {
                        text: "✅ Проверить",
                        callback_data: "check_subscription",
                    },
                ],
            ],
        },
    },
    en: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "📢 Subscribe to channel",
                        url: configurations.telegram.channelLink,
                    },
                ],
                [
                    {
                        text: "✅ Check",
                        callback_data: "check_subscription",
                    },
                ],
            ],
        },
    },
};

export const language_keyboard = {
    reply_markup: {
        inline_keyboard: [
            [
                {
                    text: "Русский",
                    callback_data: "ru",
                },
                {
                    text: "Узбекский",
                    callback_data: "uz",
                },
            ],
        ],
    },
    parse_mode: "HTML",
}

export const contact_keyboard = {
    uz: {
        reply_markup: {
            keyboard: [[{ text: "📞 Raqamni ulashish", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    },
    ru: {
        reply_markup: {
            keyboard: [[{ text: "📞 Поделиться номером", request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    },
    en: {
        reply_markup: {
            keyboard: [
                [{ text: "📞 Share your phone number", request_contact: true }],
            ],
            resize_keyboard: true,
            one_time_keyboard: true,
        },
    },
};

export const register_type_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Korxona",
                        callback_data: "enterprise",
                    },
                    {
                        text: "Ishchi",
                        callback_data: "worker",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Предприятие",
                        callback_data: "enterprise",
                    },
                    {
                        text: "Рабочий",
                        callback_data: "worker",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    },
}

export const worker_menu_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Ish qidirish",
                        callback_data: "search-work",
                    },
                ],
                [
                    {
                        text: "Malumotlarimni tahrirlash",
                        callback_data: "settings",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Поиск работы",
                        callback_data: "search-work",
                    },
                ],
                [
                    {
                        text: "Изменить мою информацию",
                        callback_data: "settings",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
}

export const vote_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Ha",
                        callback_data: "yes"
                    },
                    {
                        text: "Yo'q",
                        callback_data: "no"
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Да",
                        callback_data: "yes"
                    },
                    {
                        text: "Нет",
                        callback_data: "no"
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
}

export const gender_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Erkak",
                        callback_data: "male"
                    },
                    {
                        text: "Ayol",
                        callback_data: "female"
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Мужской",
                        callback_data: "male"
                    },
                    {
                        text: "Женский",
                        callback_data: "female"
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
}

export const enterprise_menu_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Yangi vakansiya qo'shish",
                        callback_data: "new-vacancy",
                    },
                ],
                [
                    {
                        text: "Ishchilar qidirish",
                        callback_data: "search-worker",
                    },
                ],
                [
                    {
                        text: "Ma'lumotlarimni tahrirlash",
                        callback_data: "settings",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Добавить новую вакансию",
                        callback_data: "new-vacancy",
                    },
                ],
                [
                    {
                        text: "Поиск работников",
                        callback_data: "search-worker",
                    },
                ],
                [
                    {
                        text: "О нас",
                        callback_data: "about",
                    },
                ],
                [
                    {
                        text: "Изменить мою информацию",
                        callback_data: "settings",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
}

export const worker_settings_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Ismingizni tahrirlash",
                        callback_data: "worker-edit-fullname",
                    },
                ],
                [
                    {
                        text: "Tug'ilgan sanaingizni tahrirlash",
                        callback_data: "worker-edit-birthdate",
                    },
                ],
                [
                    {
                        text: "Yashash manzilingizni tahrirlash",
                        callback_data: "worker-edit-residential-address",
                    },
                ],
                [
                    {
                        text: "Ishlash manzilini tahrirlash",
                        callback_data: "worker-edit-working-area",
                    },
                ],
                [
                    {
                        text: "Pasport seriya raqamingizni tahrirlash",
                        callback_data: "worker-edit-passport-serial-number",
                    },
                ],
                [
                    {
                        text: "Jinsingizni tahrirlash",
                        callback_data: "worker-edit-gender",
                    },
                ],
                [
                    {
                        text: "Mutaxasislikingizni tahrirlash",
                        callback_data: "worker-edit-specialization",
                    },
                ],

                [
                    {
                        text: "Tajribangizni tahrirlash",
                        callback_data: "worker-edit-experience",
                    },
                ],
                [
                    {
                        text: "Qo'shimcha xunarlaringizni tahrirlash",
                        callback_data: "worker-edit-additional-skills",
                    },
                ],
                [
                    {
                        text: "Minimal maoshingizni tahrirlash",
                        callback_data: "worker-edit-minimum-wage",
                    },
                ],
                [
                    {
                        text: "Boshqa shaharda ishlashni hohlaysizmi?",
                        callback_data: "worker-edit-work-in-a-city-other-than-the-residential-address",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Изменить имя",
                        callback_data: "worker-edit-fullname",
                    },
                ],
                [
                    {
                        text: "Изменить дату рождения",
                        callback_data: "worker-edit-birthdate",
                    }
                ],
                [
                    {
                        text: "Изменить адрес проживания",
                        callback_data: "worker-edit-residential-address",
                    }
                ],
                [
                    {
                        text: "Изменить рабочий адрес",
                        callback_data: "worker-edit-working-area",
                    }
                ],
                [
                    {
                        text: "Изменить серию и номер паспорта",
                        callback_data: "worker-edit-passport-serial-number",
                    }
                ],
                [
                    {
                        text: "Изменить свой пол",
                        callback_data: "worker-edit-gender",
                    }
                ],
                [
                    {
                        text: "Изменить свою специализацию",
                        callback_data: "worker-edit-specialization",
                    }
                ],

                [
                    {
                        text: "Редактировать свой опыт",
                        callback_data: "worker-edit-experience",
                    }
                ],
                [
                    {
                        text: "Отредактируйте свои дополнительные навыки",
                        callback_data: "worker-edit-additional-skills",
                    }
                ],
                [
                    {
                        text: "Изменить минимальную зарплату",
                        callback_data: "worker-edit-minimum-wage",
                    }
                ],
                [
                    {
                        text: "Хотите ли вы работать в другом городе?",
                        callback_data: "worker-edit-work-in-a-city-other-than-the-residential-address",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
}

export const enterprise_settings_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Korxona nomini tahrirlash",
                        callback_data: "enterprise-edit-fullname",
                    },
                ],
                [
                    {
                        text: "Korxona manzilini tahrirlash",
                        callback_data: "enterprise-edit-address",
                    }
                ],
                [
                    {
                        text: "Korxona faoliyat turini tahrirlash",
                        callback_data: "enterprise-edit-type-of-activity",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Изменить название корпорации",
                        callback_data: "enterprise-edit-fullname",
                    },
                ],
                [
                    {
                        text: "Изменить адрес корпорации",
                        callback_data: "enterprise-edit-address",
                    }
                ],
                [
                    {
                        text: "Изменить тип бизнеса",
                        callback_data: "enterprise-edit-type-of-activity",
                    }
                ]
            ],
        },
        parse_mode: "HTML",
    },
}

// Function to generate vacancy selection buttons
export const generate_vacancy_buttons = (count: number, pageSize: number, startIndex: number) => {
    // Define proper types for the buttons and rows
    type Button = { text: string; callback_data: string };
    const rows: Button[][] = [];
    
    // Create number buttons (3 per row)
    const buttonsPerRow = 3;
    for (let i = 0; i < count; i++) {
        // Show numbers from 1-6 on each page (relative position)
        const displayNumber = i + 1;
        
        const button: Button = {
            // Show position 1-6 on the button
            text: `${displayNumber}`,
            // Use position 1-6 as callback data
            callback_data: `${displayNumber}`
        };
        
        // Create a new row for every 3 buttons
        if (i % buttonsPerRow === 0) {
            rows.push([]);
        }
        
        // Add button to the last row
        rows[Math.floor(i / buttonsPerRow)].push(button);
    }
    
    return rows;
};

export const location_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Andijon Viloyati", callback_data: "location_Andijon" },
                    { text: "Buxoro Viloyati", callback_data: "location_Buxoro" }
                ],
                [
                    { text: "Farg`ona Viloyati", callback_data: "location_Farg`ona" },
                    { text: "Sirdaryo Viloyati", callback_data: "location_Sirdaryo" }
                ],
                [
                    { text: "Jizzax Viloyati", callback_data: "location_Jizzax" },
                    { text: "Namangan Viloyati", callback_data: "location_Namangan" }
                ],
                [
                    { text: "Navoiy Viloyati", callback_data: "location_Navoiy" },
                    { text: "Qoraqalpog'iston", callback_data: "location_Qoraqalpogiston" }
                ],
                [
                    { text: "Qashqadaryo Viloyati", callback_data: "location_Qashqadaryo" },
                    { text: "Samarqand Viloyati", callback_data: "location_Samarqand" }
                ],
                [
                    { text: "Surxondaryo Viloyati", callback_data: "location_Surxondaryo" },
                    { text: "Toshkent Viloyati", callback_data: "location_Toshkent_Viloyati" }
                ],
                [
                    { text: "Toshkent Shahri", callback_data: "location_Toshkent_Shahri" },
                    { text: "Xorazm Viloyati", callback_data: "location_Xorazm" }
                ]
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: "Андижанская область", callback_data: "location_Andijon" },
                    { text: "Бухарская область", callback_data: "location_Buxoro" }
                ],
                [
                    { text: "Ферганская область", callback_data: "location_Farg`ona" },
                    { text: "Сырдарьинская область", callback_data: "location_Sirdaryo" }
                ],
                [
                    { text: "Джизакская область", callback_data: "location_Jizzax" },
                    { text: "Наманганская область", callback_data: "location_Namangan" }
                ],
                [
                    { text: "Навоийская область", callback_data: "location_Navoiy" },
                    { text: "Каракалпакстан", callback_data: "location_Qoraqalpogiston" }
                ],
                [
                    { text: "Кашкадарьинская область", callback_data: "location_Qashqadaryo" },
                    { text: "Самаркандская область", callback_data: "location_Samarqand" }
                ],
                [
                    { text: "Сурхандарьинская область", callback_data: "location_Surxondaryo" },
                    { text: "Ташкентская область", callback_data: "location_Toshkent_Viloyati" }
                ],
                [
                    { text: "Город Ташкент", callback_data: "location_Toshkent_Shahri" },
                    { text: "Хорезмская область", callback_data: "location_Xorazm" }
                ]
            ],
        },
        parse_mode: "HTML",
    }
};

export const back_to_menu_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Bosh menyuga qaytish",
                        callback_data: "back-to-menu",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "Вернуться в главное меню",
                        callback_data: "back-to-menu",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    },
}

export const worker_count_keyboard = {
    uz: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '1', callback_data: 'worker-count-1' },
                    { text: '2', callback_data: 'worker-count-2' },
                    { text: '3', callback_data: 'worker-count-3' },
                ],
                [
                    { text: '4', callback_data: 'worker-count-4' },
                    { text: '5', callback_data: 'worker-count-5' },
                    { text: '6', callback_data: 'worker-count-6' },
                ],
                [
                    { text: '7', callback_data: 'worker-count-7' },
                    { text: '8', callback_data: 'worker-count-8' },
                    { text: '9', callback_data: 'worker-count-9' },
                ],
                [
                    { text: '10+', callback_data: 'worker-count-10' },
                ]
            ],
        },
        parse_mode: 'HTML',
    },
    ru: {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: '1', callback_data: 'worker-count-1' },
                    { text: '2', callback_data: 'worker-count-2' },
                    { text: '3', callback_data: 'worker-count-3' },
                ],
                [
                    { text: '4', callback_data: 'worker-count-4' },
                    { text: '5', callback_data: 'worker-count-5' },
                    { text: '6', callback_data: 'worker-count-6' },
                ],
                [
                    { text: '7', callback_data: 'worker-count-7' },
                    { text: '8', callback_data: 'worker-count-8' },
                    { text: '9', callback_data: 'worker-count-9' },
                ],
                [
                    { text: '10+', callback_data: 'worker-count-10' },
                ]
            ],
        },
        parse_mode: 'HTML',
    },
}

export const vacancy_pagination_keyboard = {
    uz: (page: number, hasNext: boolean, itemCount: number = 0) => ({
        reply_markup: {
            inline_keyboard: [
                ...generate_vacancy_buttons(Math.min(itemCount, 6), 6, (page - 1) * 6),
                [
                    page > 1 ? {
                        text: "⬅️ Oldingi",
                        callback_data: `prev_page_${page-1}`,
                    } : { text: " ", callback_data: "no_action" },
                    { 
                        text: `📄 ${page}`, 
                        callback_data: "current_page" 
                    },
                    hasNext ? {
                        text: "Keyingi ➡️",
                        callback_data: `next_page_${page+1}`,
                    } : { text: " ", callback_data: "no_action" },
                ],
                [
                    {
                        text: "🔍 Qidiruvni yakunlash",
                        callback_data: "finish_search",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    }),
    ru: (page: number, hasNext: boolean, itemCount: number = 0) => ({
        reply_markup: {
            inline_keyboard: [
                ...generate_vacancy_buttons(Math.min(itemCount, 6), 6, (page - 1) * 6),
                [
                    page > 1 ? {
                        text: "⬅️ Предыдущий",
                        callback_data: `prev_page_${page-1}`,
                    } : { text: " ", callback_data: "no_action" },
                    { 
                        text: `📄 ${page}`, 
                        callback_data: "current_page" 
                    },
                    hasNext ? {
                        text: "Следующий ➡️",
                        callback_data: `next_page_${page+1}`,
                    } : { text: " ", callback_data: "no_action" },
                ],
                [
                    {
                        text: "🔍 Завершить поиск",
                        callback_data: "finish_search",
                    },
                ],
            ],
        },
        parse_mode: "HTML",
    }),
}
        
    