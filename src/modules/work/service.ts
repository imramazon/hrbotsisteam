import repo from "./repo";

class WorkService {
    async getAll() {
        return await repo.getAll();
    }

    async getById(id: string) {
        return await repo.getById(id);
    }

    async create(data: { name: string; description: string }) {
        return await repo.create(data);
    }

    async update(id: string, data: { name?: string; description?: string }) {
        return await repo.update(id, data);
    }

    async delete(id: string) {
        return await repo.delete(id);
    }
    async getByIds(ids: string[]) {
        return await repo.getByIds(ids);
    }
}

export default new WorkService();