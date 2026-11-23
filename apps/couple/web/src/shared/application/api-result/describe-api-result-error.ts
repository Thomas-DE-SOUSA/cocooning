import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { TFunction } from 'i18next';

// The single describer of a server error (decision 0010): the backend code first, then the kind of failure, then the API message.
export function describeApiResultError(error: ApiError, t: TFunction): string {
    const codes =
        error.backendCode === null
            ? [error.code]
            : [error.backendCode, error.code];
    return t(
        codes.map((code) => `apiErrors.${code}`),
        { defaultValue: error.message },
    );
}
