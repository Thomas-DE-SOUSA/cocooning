// The Postgres error that Prisma 7 wraps in `meta.driverAdapterError.cause`, for model queries (P2002) and raw SQL (P2010) alike.
export type DriverAdapterCause = {
    readonly kind: string | null;
    readonly code: string | null;
    readonly constraintName: string | null;
};

type UnknownRecord = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === 'object' && value !== null;

const stringOrNull = (value: unknown): string | null =>
    typeof value === 'string' ? value : null;

const constraintNameOf = (constraint: unknown): string | null => {
    if (!isRecord(constraint)) return null;
    if (typeof constraint['index'] === 'string') return constraint['index'];
    const fields = constraint['fields'];
    return Array.isArray(fields) ? fields.map(String).join(',') : null;
};

export function driverAdapterCauseOf(
    error: unknown,
): DriverAdapterCause | null {
    if (!isRecord(error) || !isRecord(error['meta'])) return null;
    const adapterError = error['meta']['driverAdapterError'];
    if (!isRecord(adapterError) || !isRecord(adapterError['cause']))
        return null;
    const cause = adapterError['cause'];
    return {
        kind: stringOrNull(cause['kind']),
        code:
            stringOrNull(cause['code']) ?? stringOrNull(cause['originalCode']),
        constraintName: constraintNameOf(cause['constraint']),
    };
}
