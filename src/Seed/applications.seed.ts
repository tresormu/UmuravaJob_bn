import type { IApplication } from '../Models/Application.model.js';

// Template for applications, to be linked with dynamic IDs in seed.ts
export const applications: Partial<IApplication>[] = [
  {
    status: 'applied',
    source: 'direct',
    score: 75,
  },
  {
    status: 'screened',
    source: 'excel',
    score: 88,
    scoreExplanation: 'Strong React experience',
  },
  {
    status: 'shortlisted',
    source: 'api',
  },
];
