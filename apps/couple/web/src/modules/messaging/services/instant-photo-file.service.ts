import 'server-only';
import type { GetInstantPhotoFileUseCase } from '@cocooning/couple-client-business-logic/messaging';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { InstantPhotoParamsRequestSchema } from '@cocooning/couple-contract/messaging';

const HTTP_UNAUTHORIZED = 401;
const HTTP_NOT_FOUND = 404;

// No photo of the couple may stay in a cache, the browser's or the service worker's (decision 0036).
export const INSTANT_PHOTO_CACHE_CONTROL = 'private, no-store';

export type InstantPhotoFileAnswer =
    | {
          readonly found: true;
          readonly bytes: Uint8Array<ArrayBuffer>;
          readonly contentType: string;
      }
    | { readonly found: false; readonly status: number };

// R9: a hidden photo of the day, a withdrawn or unknown one, all answer 404; only a refused session answers 401.
export async function readInstantPhotoFile(
    instantPhotoIdInput: unknown,
    useCase: GetInstantPhotoFileUseCase,
): Promise<InstantPhotoFileAnswer> {
    const params = InstantPhotoParamsRequestSchema.safeParse({
        instantPhotoId: instantPhotoIdInput,
    });
    if (!params.success) return { found: false, status: HTTP_NOT_FOUND };
    const file = await useCase.execute(params.data.instantPhotoId);
    if (file.success) return { found: true, ...file.value };
    const status =
        file.error.code === ApiErrorCodeEnum.UNAUTHORIZED
            ? HTTP_UNAUTHORIZED
            : HTTP_NOT_FOUND;
    return { found: false, status };
}
