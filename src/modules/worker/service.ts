import repo from "./repo";

class WorkerService {
  async create(data: any) {
    const worker = await repo.create(data);

    return worker;
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
}

export default new WorkerService();