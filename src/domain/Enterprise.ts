import { IUser } from "./User";

export interface IEnterprise {
    _id: string;
    user:IUser
    name: string;
    address: string;
    typeOfActivity: string;
    certificateNumber: string;
    createdAt: Date;
    updatedAt: Date;
}
