import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
} from '@cocooning/shared-kernel/domain';
import { z } from 'zod';

export const MAX_PAGE_SIZE = 100;

export const OffsetPaginationQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(DEFAULT_PAGE),
    pageSize: z.coerce
        .number()
        .int()
        .min(1)
        .max(MAX_PAGE_SIZE)
        .default(DEFAULT_PAGE_SIZE),
});
