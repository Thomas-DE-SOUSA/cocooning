import { HttpException, HttpStatus } from '@nestjs/common';
import type { z } from 'zod';
import { parseZodIssues } from './zod-issue.parser';

export const VALIDATION_FAILED_CODE = 'VALIDATION_FAILED';

export class ZodException extends HttpException {
    constructor(error: z.ZodError) {
        super(
            {
                code: VALIDATION_FAILED_CODE,
                message: 'Validation failed',
                errors: parseZodIssues(error),
            },
            HttpStatus.UNPROCESSABLE_ENTITY,
        );
    }
}
