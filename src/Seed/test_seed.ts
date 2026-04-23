import mongoose from 'mongoose';
import * as xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';
import Recruiter from '../Models/Recruiter.model.js';
import Job from '../Models/Job.model.js';
import Question from '../Models/Question.model.js';
import HashMe from '../config/hash.config.js';
import dotenv from 'dotenv';

dotenv.config();

const RECRUITER_EMAIL = 'seed_recruiter@example.com';
const RECRUITER_PASSWORD = 'Password123!';

const seed = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/umuravajob';
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB:', mongoose.connection.name);
        console.log('Using Host:', mongoose.connection.host);

        // 1. Create/Update Recruiter
        const hashedPassword = await HashMe(RECRUITER_PASSWORD);

        // Use findOneAndUpdate with upsert to ensure we don't have duplicates and we update existing one
        const recruiter = await Recruiter.findOneAndUpdate(
            { email: RECRUITER_EMAIL.toLowerCase() },
            {
                firstName: 'Seed',
                lastName: 'Recruiter',
                email: RECRUITER_EMAIL.toLowerCase(),
                password: hashedPassword,
                role: 'recruiter',
                isEmailVerified: true,
                companyName: 'Umurava Test Corp',
                isActive: true
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (!recruiter) throw new Error("Failed to create/update recruiter");

        console.log(`Recruiter ready: ${recruiter.email} (Verified: ${recruiter.isEmailVerified})`);

        // Clean up old jobs/questions for this recruiter to avoid clutter
        await Job.deleteMany({ recruiterId: recruiter._id });
        const existingJobIds = await Job.find({ recruiterId: recruiter._id }).select('_id');
        await Question.deleteMany({ jobId: { $in: existingJobIds.map(j => j._id) } });

        // 2. Create Job
        const job = await Job.create({
            title: 'Senior Software Engineer',
            department: 'Engineering',
            employmentType: 'Full-time',
            description: 'Looking for an experienced engineer to build amazing things.',
            skills: ['Node.js', 'TypeScript', 'MongoDB'],
            experience: 5,
            location: 'Remote',
            recruiterId: recruiter._id,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
        console.log(`Job created: ${job.title} (ID: ${job._id})`);

        // 3. Create Questions
        const questions = [
            {
                jobId: job._id,
                prompt: 'What is your experience with Node.js?',
                type: 'text',
                required: true,
                order: 1
            },
            {
                jobId: job._id,
                prompt: 'Do you have experience with TypeScript?',
                type: 'boolean',
                required: true,
                order: 2
            },
            {
                jobId: job._id,
                prompt: 'What is your expected salary?',
                type: 'number',
                required: false,
                order: 3
            }
        ];
        await Question.insertMany(questions);
        console.log('Questions created');

        // 4. Generate Excel File
        const applicants = [];
        for (let i = 1; i <= 20; i++) {
            applicants.push({
                'FullName': `Applicant ${i}`,
                'Email': `applicant${i}@example.com`,
                'Phone': `+2507800000${i.toString().padStart(2, '0')}`,
                'Location': i % 2 === 0 ? 'Kigali' : 'Nairobi',
                'Skills': 'Node.js, TypeScript, React',
                'Experience': Math.floor(Math.random() * 10) + 1,
                'What is your experience with Node.js?': `${Math.floor(Math.random() * 5) + 1} years of experience building scalable APIs.`,
                'Do you have experience with TypeScript?': i % 3 === 0 ? 'No' : 'Yes',
                'What is your expected salary?': 2000 + (Math.floor(Math.random() * 10) * 500)
            });
        }

        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(applicants);
        xlsx.utils.book_append_sheet(wb, ws, 'Applicants');

        const testDataDir = path.resolve('test_data');
        if (!fs.existsSync(testDataDir)) {
            fs.mkdirSync(testDataDir);
        }
        const filePath = path.join(testDataDir, 'applicants_seed.xlsx');
        xlsx.writeFile(wb, filePath);
        console.log(`Excel file generated at: ${filePath}`);

        console.log('\n--- SEED COMPLETE ---');
        console.log(`Recruiter Email: ${RECRUITER_EMAIL}`);
        console.log(`Recruiter Password: ${RECRUITER_PASSWORD}`);
        console.log(`Job ID: ${job._id}`);
        console.log('----------------------');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
};

seed();
