import { z } from 'zod';

export function createCursorPageResponseSchema<TItem extends z.ZodType>(
    item: TItem,
) {
    return z.object({
        items: z.array(item),
        nextCursor: z.string().nullable(),
    });
}
