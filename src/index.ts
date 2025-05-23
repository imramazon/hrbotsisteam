import { configurations } from "./config/index";
import { Telegraf } from "telegraf";
import Database from "./database/core";
import server from "./server";

const PORT = configurations.port || 4001;
const HOST = configurations.host || '0.0.0.0';

import message from "./modules/telegram/bot/message";
import callback_query from "./modules/telegram/bot/callback-query";

const mainBot = new Telegraf(configurations.telegram.token);

mainBot.use(message);
mainBot.use(callback_query);

(async function () {
  try {

    const db = new Database()
    db.connect()

    await mainBot.launch();

    server.listen(PORT, () => {
      console.log(`Application run on the ${PORT}`);
    });
  } catch (e: any) {
    throw new Error(e);
  }
})();
