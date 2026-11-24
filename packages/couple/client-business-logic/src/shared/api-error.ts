export const ApiErrorCodeEnum = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    INVALID_RESPONSE: 'INVALID_RESPONSE',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    CONFLICT: 'CONFLICT',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN: 'UNKNOWN',
} as const;

export type ApiErrorCode =
    (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum];

export type ApiError = {
    readonly code: ApiErrorCode;
    readonly message: string;
    readonly backendCode: string | null;
};
