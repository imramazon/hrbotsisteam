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

  async findBySpecialization(specialization: string) {
    // Find workers with similar specialization
    // This will check if any worker's specialization array contains something similar to the provided specialization
    return await repo.findBySpecialization(specialization);
  }

  async getByUserId(userId: string) {
    return await repo.getByUserId(userId);
  }

  async getAll() {
    return await repo.getAll();
  }

  async getWorkersBySpecializations(specializationIds: string[]) {
    return await repo.getWorkersBySpecializations(specializationIds);
  }
}

export default new WorkerService();