import { z } from 'zod';

export const ValidationIssueSchema = z.object({
    path: z.string(),
    code: z.string(),
    message: z.string(),
});

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
