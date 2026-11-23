import { z } from 'zod';

export function createOffsetPageResponseSchema<TItem extends z.ZodType>(
    item: TItem,
) {
    return z.object({
        items: z.array(item),
        total: z.number(),
        page: z.number(),
        pageSize: z.number(),
    });
}
