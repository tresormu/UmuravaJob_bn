import mongoose from 'mongoose';
import Recruiter from '../Models/Recruiter.model.js';
import HashMe from '../config/hash.config.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const RECRUITER_EMAIL = 'seed_recruiter@example.com';
const RECRUITER_PASSWORD = 'Password123!';

const debugLogin = async () => {
    try {
        const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/umuravajob';
        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB:', mongoose.connection.name);
        console.log('Using Host:', mongoose.connection.host);

        const recruiter = await Recruiter.findOne({ email: RECRUITER_EMAIL.toLowerCase() });
        if (!recruiter) {
            console.log('Recruiter NOT FOUND for email:', RECRUITER_EMAIL.toLowerCase());
            // List all recruiters to see what's there
            const all = await Recruiter.find({}, { email: 1 });
            console.log('Total recruiters in DB:', all.length);
            console.log('Emails in DB:', all.map(a => a.email));
        } else {
            console.log('Recruiter found:');
            console.log('Email:', recruiter.email);
            console.log('IsVerified:', recruiter.isEmailVerified);
            console.log('HasPassword:', !!recruiter.password);
            
            const isValid = await bcrypt.compare(RECRUITER_PASSWORD, recruiter.password!);
            console.log('Password is valid (direct bcrypt):', isValid);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Debug failed:', error);
    }
};

debugLogin();
