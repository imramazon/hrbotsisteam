import { IEnterprise } from "./Enterprise";

export interface IVacancy {
  _id: string;
  enterprise: IEnterprise;
  specialists: string[];
  minimumExperience: string;
  opportunitiesForWorkers: string;
  salary: number;
  status: string;
  area: string;
  createdAt: Date;
  updatedAt: Date;
}
