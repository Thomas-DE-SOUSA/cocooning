// The grouped count of a query: a key that never appears is absent, as in a GROUP BY.
export const countBy = (
    keys: ReadonlyArray<string>,
): ReadonlyMap<string, number> =>
    keys.reduce(
        (counts, key) =>
            new Map([...counts, [key, (counts.get(key) ?? 0) + 1]]),
        new Map<string, number>(),
    );
