import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';
import type { z } from 'zod';
import type { HttpRequestConfig } from './http-request-options';

export function parseResponse<TSchema extends z.ZodType, TError>(
    result: Result<unknown, TError>,
    schema: TSchema,
    config: HttpRequestConfig<TError>,
): Result<z.infer<TSchema>, TError> {
    if (!result.success) return result;
    const parsed = schema.safeParse(result.value);
    if (!parsed.success) {
        return fail(
            config.createInvalidResponseError(
                'Response does not match its contract',
            ),
        );
    }
    return ok(parsed.data);
}
