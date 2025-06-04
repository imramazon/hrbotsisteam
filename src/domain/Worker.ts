import { IUser } from "./User";

export interface IWorker {
    _id: string;
    user: IUser;
    fullName: string;
    birthDate: string;
    residentialAddress: string;
    workingArea: string;
    passportSerialNumber: string;
    gender: string;
    specialization: string[];
    profession: string;
    experience: string;
    additionalSkills: string[];
    minimumWage: string;
    workInACityOtherThanTheResidentialAddress: boolean;
    is_student: boolean;
    studentWorks: string[];
    createdAt: Date;
    updatedAt: Date;
}
