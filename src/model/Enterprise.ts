import { Schema, model } from "mongoose";
import { IEnterprise } from "../domain/Enterprise";

const EnterpriseSchema = new Schema<IEnterprise>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    typeOfActivity: {
      type: String,
    },
    certificateNumber: {
      type: String,
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

export default model<IEnterprise>("Enterprise", EnterpriseSchema);