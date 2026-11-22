export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 25;

export type OffsetPaginationParams = {
    readonly page: number;
    readonly pageSize: number;
};

export type CursorPaginationParams = {
    readonly cursor: string | null;
    readonly limit: number;
};
