import type { OffsetPaginationParams } from '@cocooning/shared-kernel/domain';
import { ZodException } from '../zod/zod.exception';
import { OffsetPaginationQuerySchema } from './offset-pagination.schema';

export function parseOffsetPagination(query: unknown): OffsetPaginationParams {
    const result = OffsetPaginationQuerySchema.safeParse(query);
    if (!result.success) throw new ZodException(result.error);
    return result.data;
}
