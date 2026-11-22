import type { z } from 'zod';

export type ValidationIssue = {
    readonly path: string;
    readonly code: string;
    readonly message: string;
};

export const ROOT_PATH = '(root)';

export function parseZodIssues(
    error: z.ZodError,
): ReadonlyArray<ValidationIssue> {
    return error.issues.map((issue) => ({
        path:
            issue.path.length === 0
                ? ROOT_PATH
                : issue.path.map(String).join('.'),
        code: issue.code,
        message: issue.message,
    }));
}
