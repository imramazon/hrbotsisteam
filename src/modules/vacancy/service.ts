import repo from "./repo";

class VacancyService {
    async create(data: any) {
        const draftVacancy = await this.getDraftVacancyByEnterpriseId(data.enterpriseId);
        if (draftVacancy) {
            return draftVacancy;
        }
        return await repo.create(data);
    }

    async getVacancyByEnterpriseId(enterpriseId: string) {
        return await repo.getVacancyByEnterpriseId(enterpriseId);
    }

    async update(vacancyId: string, data: any) {
        return await repo.update(vacancyId, data);
    }

    async updateStatus(vacancyId: string, status: string) {
        return await repo.updateStatus(vacancyId, status);
    }
    
    async getDraftVacancyByEnterpriseId(enterpriseId: string) {
        return await repo.getDraftVacancyByEnterpriseId(enterpriseId);
    }

    async getAllActiveVacancies(text: string) {
        return await repo.getAllActiveVacancies(text);
    }
}

export default new VacancyService();