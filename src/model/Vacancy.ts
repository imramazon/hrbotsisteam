import { Schema, model } from "mongoose";
import { IVacancy } from "../domain/Vacancy";

const VacancySchema = new Schema<IVacancy>(
    {
        enterprise: {
            type: Schema.Types.ObjectId,
            ref: "Enterprise",
        },
        specialists: [{
            type: String,
        }],
        minimumExperience: {
            type: String,
        },
        opportunitiesForWorkers: {
            type: String,
        },
        salary: {
            type: Number,
        },
        status: {
            type: String,
            enum: ["active", "inactive","draft"],
            default: "draft",
        },
        area: {
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

// Create text index on specialists field for text search
VacancySchema.index({ specialists: 'text', area: 'text' });

export default model<IVacancy>("Vacancy", VacancySchema);
