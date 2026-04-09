import type { Request, Response } from "express";
export declare const createJob: (req: Request, res: Response) => Promise<void>;
export declare const getAllJobs: (_req: Request, res: Response) => Promise<void>;
export declare const getJobById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateJob: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteJob: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=Job.controller.d.ts.map