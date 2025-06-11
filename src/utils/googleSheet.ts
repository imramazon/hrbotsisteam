import { google } from "googleapis";
import { configurations } from "../config/index";
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});


const sheets = google.sheets("v4");

export async function writeWorkerToSheet(data: any[]) {
  const spreadsheetId = configurations.googleConfig.sheetId;
  const range = "Worker!A:M";
  console.log(data)
  const values = data.map((obj) => [
    obj.fullName,
    obj.birthDate,
    obj.gender,
    obj.residentialAddress,
    obj.workingArea,
    obj.passportSerialNumber,
    // Fix: convert arrays to string for Google Sheets
    Array.isArray(obj.specialization) ? obj.specialization.join(", ") : obj.specialization,
    obj.experience,
    obj.minimumWage,
    obj.phoneNumber,
    Array.isArray(obj.additionalSkills) ? obj.additionalSkills.join(", ") : obj.additionalSkills,
    obj._id,
    obj.createdAt,
  ]);

  const request = {
    auth,
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values,
    },
  };
  try {
    const response = await sheets.spreadsheets.values.append(request);
    console.log("Data written successfully:", response.data);
  } catch (error: any) {
    if (error.message) {
      console.error("Error writing data:", error.message);
    } else {
      console.error("An error occurred while writing data:", error);
    }
  }
}

export async function writeEnterpriseToSheet(data: any[]) {
  const spreadsheetId = configurations.googleConfig.sheetId;
  const range = "Worker!A:M";

  const values = data.map((obj) => [
    obj.fullName,
    obj.birthDate,
    obj.gender,
    obj.residentialAddress,
    obj.workingArea,
    obj.passportSerialNumber,
    // Fix: convert arrays to string for Google Sheets
    Array.isArray(obj.specialization) ? obj.specialization.join(", ") : obj.specialization,
    obj.experience,
    obj.minimumWage,
    obj.phoneNumber,
    Array.isArray(obj.additionalSkills) ? obj.additionalSkills.join(", ") : obj.additionalSkills,
    obj._id,
    obj.createdAt,
  ]);

  const request = {
    auth,
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    resource: {
      values,
    },
  };
  try {
    const response = await sheets.spreadsheets.values.append(request);
    console.log("Data written successfully:", response.data);
  } catch (error: any) {
    if (error.message) {
      console.error("Error writing data:", error.message);
    } else {
      console.error("An error occurred while writing data:", error);
    }
  }
}