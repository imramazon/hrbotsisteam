import { Schema, model } from "mongoose";
import { IUser } from "../domain/User";

const UserSchema = new Schema<IUser>(
  {
    chatId: {
      type: String,
    },
    fullName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    username: {
      type: String,
    },
    telegramLanguage: {
      type: String,
    },
    telegramStep: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum:["enterprise","worker"]
    },
  },
  {
    versionKey: false,
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

export default model<IUser>("User", UserSchema);

