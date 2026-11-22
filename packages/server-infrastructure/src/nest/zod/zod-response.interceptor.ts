import {
    type CallHandler,
    type ExecutionContext,
    InternalServerErrorException,
    type NestInterceptor,
} from '@nestjs/common';
import type { Logger } from '@cocooning/shared-kernel/ports';
import { map, type Observable } from 'rxjs';
import type { z } from 'zod';
import { parseZodIssues } from './zod-issue.parser';

// The parsed value is returned, not the handler's: unknown keys are stripped, so the schema is the response whitelist.
export class ZodResponseInterceptor<
    TSchema extends z.ZodType,
> implements NestInterceptor<unknown, z.output<TSchema>> {
    constructor(
        private readonly schema: TSchema,
        private readonly logger: Logger,
    ) {
        this.logger.setContext(ZodResponseInterceptor.name);
    }

    intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Observable<z.output<TSchema>> {
        return next.handle().pipe(map((data) => this.validate(context, data)));
    }

    private validate(
        context: ExecutionContext,
        data: unknown,
    ): z.output<TSchema> {
        const result = this.schema.safeParse(data);
        if (result.success) return result.data;
        this.logger.error('Response validation failed', {
            handler: `${context.getClass().name}.${context.getHandler().name}`,
            issues: parseZodIssues(result.error),
        });
        throw new InternalServerErrorException('Invalid response format');
    }
}
