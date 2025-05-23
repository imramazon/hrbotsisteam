import { Schema, model } from "mongoose";
import { IWorker } from "../domain/Worker";

const WorkerSchema = new Schema<IWorker>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        fullName: {
            type: String,
        },
        birthDate: {
            type: String,
        },
        residentialAddress: {
            type: String,
        },
        workingArea: {
            type: String,
        },
        passportSerialNumber: {
            type: String,
        },
        gender: {
            type: String,
        },
        specialization: [{
            type: String,
        }],
        profession: {
            type: String,
        },
        experience: {
            type: String,
        },
        additionalSkills: [{
            type: String,
        }],
        minimumWage: {
            type: Number,
        },
        workInACityOtherThanTheResidentialAddress: {
            type: Boolean,
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
)

export default model<IWorker>("Worker", WorkerSchema);
