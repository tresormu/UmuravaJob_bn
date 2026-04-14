import type { IQuestion } from '../Models/Question.model.js';

// Template for questions, to be assigned to jobs dynamically in seed.ts
export const frontendJobQuestions: Partial<IQuestion>[] = [
  {
    prompt: 'Describe your experience with React hooks.',
    type: 'text',
    required: true,
    order: 1,
  },
  {
    prompt: 'Which CSS framework do you prefer?',
    type: 'single_choice',
    options: ['Tailwind CSS', 'Bootstrap', 'Material-UI', 'Chakra UI', 'None', 'Real Answer'],
    required: true,
    order: 2,
  },
  {
    prompt: 'Select your proficiency levels:',
    type: 'multi_choice',
    options: ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Real Answer'],
    order: 3,
  },
  {
    prompt: 'Years of professional experience?',
    type: 'number',
    required: true,
    order: 4,
  },
  {
    prompt: 'Do you have TypeScript experience?',
    type: 'boolean',
    order: 5,
  },
];

export const backendJobQuestions: Partial<IQuestion>[] = [
  {
    prompt: 'Experience with database design?',
    type: 'text',
    required: true,
    order: 1,
  },
  {
    prompt: 'Favorite Node.js framework?',
    type: 'single_choice',
    options: ['Express', 'NestJS', 'Fastify', 'Koa', 'Real Answer'],
    order: 2,
  },
  {
    prompt: 'API development experience (months)?',
    type: 'number',
    order: 3,
  },
];
