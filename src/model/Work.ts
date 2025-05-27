import { Schema, model } from "mongoose";
import { IWork } from "../domain/Work";

const WorkSchema = new Schema<IWork>(
    {
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        }
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

export default model<IWork>("Work", WorkSchema);
