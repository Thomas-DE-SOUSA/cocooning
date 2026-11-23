export type Result<TValue, TError> =
    | { readonly success: true; readonly value: TValue }
    | { readonly success: false; readonly error: TError };

export function ok<TValue>(value: TValue): Result<TValue, never> {
    return { success: true, value };
}

export function fail<TError>(error: TError): Result<never, TError> {
    return { success: false, error };
}
