import repo from "./repo";

class EnterpriseService {
  async create(data: any) {
    const enterprise = await repo.create(data);

    return enterprise;
  }

  async update(userId: string, data: any) {
    const updateFileds: any = {};

    for (const key in data) {
      if (data[key] != undefined) {
        updateFileds[key] = data[key];
      }
    }

    return await repo.update(userId, updateFileds);
  }

  async getByUserId(userId: string) {
    return await repo.getByUserId(userId);
  }
}

export default new EnterpriseService();
