import {
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
} from '@cocooning/shared-kernel/domain';
import { z } from 'zod';

export const CursorPaginationQuerySchema = z.object({
    cursor: z.uuid().nullable().default(null),
    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(MAX_PAGE_SIZE)
        .default(DEFAULT_PAGE_SIZE),
});

export type CursorPaginationQuery = z.infer<typeof CursorPaginationQuerySchema>;
