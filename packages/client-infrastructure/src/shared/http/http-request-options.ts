import type { HttpMethod } from './http-method.enum';

export type HttpRequest = {
    readonly url: string;
    readonly method: HttpMethod;
    readonly headers: Readonly<Record<string, string>>;
    readonly body: unknown;
};

export type HttpRequestConfig<TError> = {
    readonly timeoutMs: number;
    readonly mapHttpError: (status: number, body: unknown) => TError;
    readonly createNetworkError: (message: string) => TError;
    readonly createInvalidResponseError: (message: string) => TError;
};
