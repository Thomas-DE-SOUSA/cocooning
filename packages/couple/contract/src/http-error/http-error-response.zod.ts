import { z } from 'zod';
import { ValidationIssueSchema } from './validation-issue.zod';

export const HttpErrorResponseSchema = z.object({
    status: z.number(),
    message: z.string(),
    code: z.string().optional(),
    context: z
        .record(z.string(), z.union([z.string(), z.number()]))
        .nullable()
        .optional(),
    errors: z.array(ValidationIssueSchema).optional(),
});

export type HttpErrorResponse = z.infer<typeof HttpErrorResponseSchema>;
