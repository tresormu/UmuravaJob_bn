import mongoose from 'mongoose';
import { jobs as jobTemplates } from './jobs.seed.js';
import { frontendJobQuestions, backendJobQuestions } from './questions.seed.js';
import { applicants as applicantTemplates } from './applicants.seed.js';
import { applications as applicationTemplates } from './applications.seed.js';
import Job from '../Models/Job.model.js';
import Question from '../Models/Question.model.js';
import Applicant from '../Models/Applicant.model.js';
import Application from '../Models/Application.model.js';
import Candidate from '../Models/Candidate.model.js';
import Recruiter from '../Models/Recruiter.model.js';
import Answer from '../Models/Answer.model.js';
import HashMe from '../config/hash.config.js';

export const TEST_RECRUITER_EMAIL = 'test@test.com';
export const TEST_RECRUITER_PASSWORD = 'password123';

export const seedData = async () => {
    try {
        console.log('🌱 Seeding database with dynamic data...');
        
        // 1. Clear everything
        await Job.deleteMany({});
        await Question.deleteMany({});
        await Applicant.deleteMany({});
        await Application.deleteMany({});
        await Candidate.deleteMany({});
        await Recruiter.deleteMany({});
        await Answer.deleteMany({});
        console.log('✅ Collections cleared');

        // 2. Create/Update Recruiter
        const hashedPassword = await HashMe(TEST_RECRUITER_PASSWORD);
        const recruiter = await Recruiter.findOneAndUpdate(
            { email: TEST_RECRUITER_EMAIL },
            {
                firstName: 'Test',
                lastName: 'Recruiter',
                email: TEST_RECRUITER_EMAIL,
                password: hashedPassword,
                role: 'recruiter',
                isEmailVerified: true,
                companyName: 'Umurava Test Corp',
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        if (!recruiter) {
            throw new Error("RECRUITER_CREATION_FAILED: Recruiter Doc is null");
        }
        
        // Safety check: verify findById
        const verified = await Recruiter.findById(recruiter._id);
        if (!verified) {
            throw new Error(`RECRUITER_NOT_IN_DB: ID ${recruiter._id} not found immediately after creation`);
        }

        console.log(`✅ Recruiter ready: ${recruiter.email} (ID: ${recruiter._id})`);

        // 3. Create/Update Candidates
        const candidateData = [
            { email: 'candidate1@test.com', fullName: 'Candidate One' },
            { email: 'candidate2@test.com', fullName: 'Candidate Two' },
            { email: 'candidate3@test.com', fullName: 'Candidate Three' },
        ];
        
        await Promise.all(candidateData.map(c => 
            Candidate.updateOne({ email: c.email }, { $set: c }, { upsert: true })
        ));
        const candidates = await Candidate.find({ email: { $in: candidateData.map(c => c.email) } });
        console.log(`✅ ${candidates.length} candidates ready`);

        // 4. Create Jobs (linked to Recruiter)
        const jobDocs = jobTemplates.map(job => ({
            ...job,
            recruiterId: recruiter._id,
        }));
        const savedJobs = await Job.insertMany(jobDocs);
        console.log(`✅ ${savedJobs.length} jobs created`);

        const frontendJob = savedJobs.find(j => j.title === 'Frontend Developer');
        const backendJob = savedJobs.find(j => j.title === 'Backend Engineer (Node.js)');

        // 5. Create Questions (linked to Jobs)
        if (frontendJob) {
            const qDocs = frontendJobQuestions.map(q => ({ ...q, jobId: frontendJob._id }));
            await Question.insertMany(qDocs);
        }
        if (backendJob) {
            const qDocs = backendJobQuestions.map(q => ({ ...q, jobId: backendJob._id }));
            await Question.insertMany(qDocs);
        }
        console.log('✅ Questions created');

        // 6. Create Applicants/Applications
        if (frontendJob) {
            // Applicants for frontend job
            const appTemplates = applicantTemplates.map((a: any) => ({
                ...a,
                jobId: frontendJob._id,
                recruiterId: recruiter._id,
            }));
            await Applicant.insertMany(appTemplates);

            // Applications for frontend job (linking to candidates)
            const applicationDocs = [
                {
                    ...applicationTemplates[0],
                    jobId: frontendJob._id,
                    candidateId: candidates[0]?._id,
                    recruiterId: recruiter._id,
                },
                {
                    ...applicationTemplates[1],
                    jobId: frontendJob._id,
                    candidateId: candidates[1]?._id,
                    recruiterId: recruiter._id,
                },
                {
                    ...applicationTemplates[2],
                    jobId: frontendJob._id,
                    candidateId: candidates[2]?._id,
                    recruiterId: recruiter._id,
                }
            ];
            await Application.insertMany(applicationDocs);
        }

        console.log('🎉 Database seeded successfully with dynamic IDs!');
    } catch (error) {
        console.error('💥 Seed error:', error);
        throw error;
    }
};

// If run directly
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/umuravajob';
    mongoose.connect(mongoUrl)
        .then(async () => {
            await seedData();
            await mongoose.disconnect();
        })
        .catch(err => console.error(err));
}
