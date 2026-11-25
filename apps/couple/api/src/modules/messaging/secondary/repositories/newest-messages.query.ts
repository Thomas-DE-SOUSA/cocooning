// Decision 0025: UUID v7 sorts by creation, so the page after the cursor is the ids below it, newest first.
export const newestOf = (
    coupleId: string,
    before: string | null,
    count: number,
) => ({
    where: before === null ? { coupleId } : { coupleId, id: { lt: before } },
    orderBy: { id: 'desc' as const },
    take: count,
});
