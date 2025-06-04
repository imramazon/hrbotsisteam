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

    async getAll() {
        return await Worker.find().populate('user').exec();
    }

    async getWorkersBySpecializations(specializationIds: string[], workerType?: string) {
        // Build query based on specializations
        const query: any = {
            specialization: { $in: specializationIds }
        };
        
        // If workerType is specified, filter by is_student status
        if (workerType) {
            // For apprentice workers (students)
            if (workerType === 'student') {
                query.is_student = true;
                console.log('Filtering for apprentice (student) workers only');
            }
            // For regular workers
            else if (workerType === 'regular') {
                // query.is_student = false;
                console.log('Filtering for regular workers only');
            }
        }
        
        console.log('Worker search query:', JSON.stringify(query));
        
        // Execute the query
        return await Worker.find(query).populate('user').exec();
    }
}

export default new WorkerRepository();