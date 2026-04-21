import type { JobAttrs } from '../Models/Job.model.js';

// Partial jobs without IDs. Seeding logic will assign these.
export const jobs: Partial<JobAttrs>[] = [
  {
    title: 'Frontend Developer',
    description: 'Build responsive web applications using React and TypeScript.',
    skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
    experience: 2,
    education: "Bachelor's in Computer Science",
    location: 'Kigali, Rwanda',
  },
  {
    title: 'Backend Engineer (Node.js)',
    description: 'Develop scalable APIs with Node.js, Express, and MongoDB.',
    skills: ['Node.js', 'Express', 'MongoDB', 'TypeScript', 'REST APIs'],
    experience: 3,
    education: "Bachelor's in Software Engineering",
    location: 'Remote',
  },
];
