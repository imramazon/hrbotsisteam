export interface IUser {
  id: string;
  _id: string;
  chatId: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  telegramLanguage: string;
  telegramStep: number;
  type: string;
  vacancyList: JSON;
  currentPage: number;
  selectedWorks: JSON;
  vacancySearchType:string
  selectedReceiptId: string;
  workerCount: number;
  currentVacancyId: string;
  createdAt: Date;
  updatedAt: Date;
}
