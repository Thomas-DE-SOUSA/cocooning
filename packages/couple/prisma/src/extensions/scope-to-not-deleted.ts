export type WhereClause = Readonly<Record<string, unknown>>;

// An explicit `deletedAt` criterion is the caller's choice and is kept as is.
export function scopeToNotDeleted(where: WhereClause | undefined): WhereClause {
    if (where !== undefined && where['deletedAt'] !== undefined) return where;
    return { ...where, deletedAt: null };
}
