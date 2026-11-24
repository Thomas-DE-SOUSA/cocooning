import type { HttpRequestConfig } from '@cocooning/client-infrastructure/shared/http';
import {
    type ApiError,
    type ApiErrorCode,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { HttpErrorResponseSchema } from '@cocooning/couple-contract/http-error';

const CODE_BY_STATUS: Readonly<Record<number, ApiErrorCode>> = {
    400: ApiErrorCodeEnum.VALIDATION_ERROR,
    401: ApiErrorCodeEnum.UNAUTHORIZED,
    403: ApiErrorCodeEnum.FORBIDDEN,
    404: ApiErrorCodeEnum.NOT_FOUND,
    409: ApiErrorCodeEnum.CONFLICT,
    422: ApiErrorCodeEnum.VALIDATION_ERROR,
};

export function createCoupleHttpConfig(
    timeoutMs: number,
): HttpRequestConfig<ApiError> {
    return {
        timeoutMs,
        mapHttpError: mapCoupleHttpError,
        createNetworkError: (message) =>
            anApiError(ApiErrorCodeEnum.NETWORK_ERROR, message),
        createInvalidResponseError: (message) =>
            anApiError(ApiErrorCodeEnum.INVALID_RESPONSE, message),
    };
}

function mapCoupleHttpError(status: number, body: unknown): ApiError {
    const code = CODE_BY_STATUS[status] ?? ApiErrorCodeEnum.UNKNOWN;
    const parsed = HttpErrorResponseSchema.safeParse(body);
    if (!parsed.success) return anApiError(code, `HTTP ${status}`);
    return {
        code,
        message: parsed.data.message,
        backendCode: parsed.data.code ?? null,
    };
}

function anApiError(code: ApiErrorCode, message: string): ApiError {
    return { code, message, backendCode: null };
}
