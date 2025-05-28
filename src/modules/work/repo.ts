import Work from "../../model/Work";

class WorkRepository {
    async getAll() {
        return await Work.find().sort({ createdAt: -1 }).exec();
    }

    async getById(id: string) {
        return await Work.findById(id).exec();
    }

    async create(data: { name: string; description: string }) {
        const newWork = new Work({
            name: data.name,
            description: data.description
        });

        await newWork.save();
        return newWork;
    }

    async update(id: string, data: { name?: string; description?: string }) {
        const updateFields: { name?: string; description?: string } = {};

        if (data.name !== undefined) {
            updateFields.name = data.name;
        }

        if (data.description !== undefined) {
            updateFields.description = data.description;
        }

        return await Work.findByIdAndUpdate(
            id, 
            updateFields, 
            { new: true }
        ).exec();
    }

    async delete(id: string) {
        return await Work.findByIdAndDelete(id).exec();
    }
}

export default new WorkRepository();