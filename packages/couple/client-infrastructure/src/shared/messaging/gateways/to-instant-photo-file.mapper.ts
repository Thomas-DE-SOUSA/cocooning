import type {
    HttpBytesResponse,
    HttpRequestConfig,
} from '@cocooning/client-infrastructure/shared/http';
import {
    type InstantPhotoFile,
    isInstantPhotoContentType,
} from '@cocooning/couple-client-business-logic/messaging';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { fail, ok, type Result } from '@cocooning/shared-kernel/utils';

// The contract of a file: one of the formats of R3, the one the API detected from the bytes.
export function toInstantPhotoFile(
    result: Result<HttpBytesResponse, ApiError>,
    config: HttpRequestConfig<ApiError>,
): Result<InstantPhotoFile, ApiError> {
    if (!result.success) return result;
    const { bytes, contentType } = result.value;
    if (!isInstantPhotoContentType(contentType)) {
        return fail(
            config.createInvalidResponseError(
                'Instant photo file has an unknown content type',
            ),
        );
    }
    return ok({ bytes, contentType });
}
