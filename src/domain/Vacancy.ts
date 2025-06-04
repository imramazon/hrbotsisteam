import { IEnterprise } from "./Enterprise";

export interface IVacancy {
  _id: string;
  enterprise: IEnterprise;
  specialists: string[];
  minimumExperience: string;
  opportunitiesForWorkers: string;
  salary: string;
  status: string;
  area: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}
