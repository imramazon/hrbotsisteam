import mongoose from "mongoose";
import { configurations } from "../../config/index";

export default class Database {
  static connect() {
    throw new Error("Method not implemented.");
  }
  url: any = configurations.mongodb.url;

  connect() {
    mongoose.set("strictQuery", false);

    return mongoose
      .connect(this.url)
      .then(() => {
        console.log(`Database connected`);
      })
      .catch((error) => {
        console.error(`Database connection error: ${error}`);
      });
  }
}
