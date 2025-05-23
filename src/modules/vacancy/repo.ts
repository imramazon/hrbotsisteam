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

  async getAllActiveVacancies(text: string) {
    // If text is provided, use it to filter by specialists
    // Otherwise, just get all active vacancies
    if (text && text.trim() !== '') {
      // Using regex search instead of text index for now
      return await Vacancy.find({
        specialists: { $regex: text, $options: 'i' },
        status: "active"
      }).populate('enterprise');
    } else {
      // Get all active vacancies if no search text
      return await Vacancy.find({ status: "active" }).populate('enterprise');
    }
  }
}

export default new VacancyRepository();