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
}

export default new WorkerRepository();