import repo from "./repo";

class UsersService {
  async create(data: any) {
    const user = await repo.getUserByChatId(data.chatId);

    if (user) {
      return user;
    }

    const newUser = await repo.create(data);

    return newUser;
  }

  async getUserByChatId(chatId: string) {
    return await repo.getUserByChatId(chatId);
  }

  async update(id: any, data: any) {
    return await repo.updateUserByChatId(id, data);
  }

  async getUserById(id: string) {
    return await repo.getUserById(id);
  }
}

export default new UsersService();
