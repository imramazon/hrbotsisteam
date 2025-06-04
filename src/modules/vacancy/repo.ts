import Vacancy from "../../model/Vacancy";

class VacancyRepository {
  async create(data: any) {
    const { enterprise, specialists, minimumExperience, opportunitiesForWorkers, salary } = data;

    const newVacancy = new Vacancy({
      enterprise,
      specialists,
      minimumExperience,
      opportunitiesForWorkers,
      salary,
    });

    await newVacancy.save();

    return newVacancy;
  }

  async getVacancyByEnterpriseId(enterpriseId: string) {
    return await Vacancy.findOne({ enterprise: enterpriseId });
  }

  async update(vacancyId: string, data: any) {
    const updateFileds: any = {};

    for (const key in data) {
      if (data[key] != undefined) {
        updateFileds[key] = data[key];
      }
    }

    return await Vacancy.updateOne({ _id: vacancyId }, updateFileds);
  }

  async updateStatus(vacancyId: string, status: string) {
    return await Vacancy.updateOne({ _id: vacancyId }, { status: status });
  }

  async getDraftVacancyByEnterpriseId(enterpriseId: string) {
    return await Vacancy.findOne({ enterprise: enterpriseId , status: "draft"});
  }

  async getAllActiveVacancies(text: string, vacancyType?: string) {
    // Build base query
    const query: any = { status: "active" };
    
    // Add text filter if provided
    if (text && text.trim() !== '') {
      query.specialists = { $regex: text, $options: 'i' };
    }
    
    // Add type filter if provided
    if (vacancyType && (vacancyType === 'work' || vacancyType === 'student')) {
      query.type = vacancyType;
      console.log(`Filtering vacancies by type: ${vacancyType}`);
    }
    
    // Execute the query
    return await Vacancy.find(query).populate('enterprise');
  }
}

export default new VacancyRepository();