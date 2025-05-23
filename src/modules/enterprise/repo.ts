import e from "express";
import Enterprise from "../../model/Enterprise";

class EnterpriseRepository {
  async create(data: any) {
    const { user, name, address, typeOfActivity, certificateNumber } = data;

    const newEnterprise = new Enterprise({
      user,
      name,
      address,
      typeOfActivity,
      certificateNumber,
    });

    await newEnterprise.save();

    return newEnterprise;
  }

  async update(userId: string, data: any) {
    const updateFileds:any = {};

    for (const key in data) {
      if (data[key] != undefined) {
        updateFileds[key] = data[key];
      }
    }

    return await Enterprise.updateOne({ user: userId }, updateFileds);
  }

  async getByUserId(userId: string) {
    return await Enterprise.findOne({ user: userId });
  }
}

export default new EnterpriseRepository();
