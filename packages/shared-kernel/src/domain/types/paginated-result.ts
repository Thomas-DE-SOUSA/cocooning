export type OffsetPage<T> = {
    readonly items: ReadonlyArray<T>;
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
};

export type CursorPage<T> = {
    readonly items: ReadonlyArray<T>;
    readonly nextCursor: string | null;
};
