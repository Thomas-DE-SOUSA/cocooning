import type { HttpRequestConfig } from '../http-request-options';

export type TestError =
    | { readonly kind: 'http'; readonly status: number; readonly body: unknown }
    | { readonly kind: 'network'; readonly message: string }
    | { readonly kind: 'invalid-response'; readonly message: string };

export const TEST_HTTP_CONFIG: HttpRequestConfig<TestError> = {
    timeoutMs: 1000,
    mapHttpError: (status, body) => ({ kind: 'http', status, body }),
    createNetworkError: (message) => ({ kind: 'network', message }),
    createInvalidResponseError: (message) => ({
        kind: 'invalid-response',
        message,
    }),
};
