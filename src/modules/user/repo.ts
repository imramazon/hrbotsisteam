import Users from "../../model/User";

class UsersRepository {
  async create(data: any) {
    const { chatId, fullName, phoneNumber, telegramLanguage,username } = data;

    const newUser = new Users({
      chatId,
      fullName,
      phoneNumber,
      telegramLanguage,
      username,
      telegramStep: 0,
    });

    await newUser.save();

    return newUser;
  }

  async getUserByChatId(chatId: string) {
    return await Users.findOne({ chatId: chatId });
  }

  async updateUserByChatId(chatId: string, data: any) {
    const updateFileds:any = {};

    for (const key in data) {
      if (data[key] != undefined) {
        updateFileds[key] = data[key];
      }
    }

    return await Users.updateOne({ chatId: chatId }, updateFileds);
  }
  async getUserById(id: string) {
    return await Users.findById(id);
  }
}

export default new UsersRepository();
