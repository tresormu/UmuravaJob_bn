import type { ApplicantAttrs } from '../Models/Applicant.model.js';

// Template for applicants, to be used with dynamic job and recruiter IDs in seed.ts
export const applicants: Partial<ApplicantAttrs>[] = [
  {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+250788123456',
    location: 'Kigali',
    resumeUrl: 'https://example.com/resume1.pdf',
    status: 'applied',
    source: 'manual',
    isParsed: false,
  },
  {
    fullName: 'Jane Smith',
    email: 'jane.smith@email.com',
    status: 'screened',
    source: 'umurava',
    isParsed: true,
    parsedData: { skills: ['React', 'TypeScript'], experienceYears: 3 },
  },
  {
    fullName: 'Alice Johnson',
    status: 'shortlisted',
    source: 'csv',
    tags: ['senior'],
    isParsed: true,
  },
];