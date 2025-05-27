import Worker from "../../model/Worker";

class WorkerRepository {
    async create(data: any) {
        const { user, fullName, birthDate, residentialAddress, workingArea, passportSerialNumber, gender, specialization, profession, experience, additionalSkills, minimumWage, workInACityOtherThanTheResidentialAddress } = data;

        const newUser = new Worker({
            user,
            fullName,
            birthDate,
            residentialAddress,
            workingArea,
            passportSerialNumber,
            gender,
            specialization,
            profession,
            experience,
            additionalSkills,
            minimumWage,
            workInACityOtherThanTheResidentialAddress,
        });

        await newUser.save();

        return newUser;
    }
    async update(userId: string, data: any) {
        const updateFileds: any = {};

        for (const key in data) {
            if (data[key] != undefined) {
                updateFileds[key] = data[key];
            }
        }

        return await Worker.updateOne({ user: userId }, updateFileds);
    }
    
    async findBySpecialization(specialization: string) {
        // Use a case-insensitive regex to find workers with similar specialization
        // This uses MongoDB's $regex operator to find partial matches
        const regex = new RegExp(specialization, 'i');
        
        // Find workers where any element in the specialization array matches the regex
        const workers = await Worker.find({ specialization: { $elemMatch: { $regex: regex } } })
            .populate('user')
            .exec();
        
        return workers;
    }

    async getByUserId(userId: string) {
        return await Worker.findOne({ user: userId }).populate('user');
    }
}

export default new WorkerRepository();