import type { HttpRequestConfig } from '@cocooning/client-infrastructure/shared/http';
import type { RecordedFetchCall } from '@cocooning/client-infrastructure/testing';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { INSTANT_PHOTO_FORM_FIELD } from '@cocooning/couple-contract/messaging';
import { createCoupleHttpConfig } from '../../../couple-http-config';
import type { SessionTokenProvider } from '../../../session/session-headers';
import {
    type MessagingEndpoints,
    resolveMessagingEndpoints,
} from '../../endpoints/messaging.endpoints';

export const SESSION_COOKIE = { Cookie: 'cocooning_session=session-token-1' };
export const ACCEPT = { Accept: 'application/json' };
export const JSON_BODY = { ...ACCEPT, 'Content-Type': 'application/json' };

type GatewayClass<T> = new (
    endpoints: MessagingEndpoints,
    httpConfig: HttpRequestConfig<ApiError>,
    getSessionToken: SessionTokenProvider,
) => T;

export const aMessagingGateway = <T>(
    Gateway: GatewayClass<T>,
    token: string | null = 'session-token-1',
): T =>
    new Gateway(
        resolveMessagingEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );

export const anApiRefusal = (status: number, code: string, message: string) =>
    JSON.stringify({ status, code, message, context: null });

export type SentPhoto = {
    readonly fileName: string;
    readonly contentType: string;
    readonly bytes: Uint8Array;
};

// The photo field of a multipart body, as the API's multer reads it.
export async function sentPhotoOf(call: RecordedFetchCall): Promise<SentPhoto> {
    if (!(call.body instanceof FormData))
        throw new Error('Not a FormData body');
    const file = call.body.get(INSTANT_PHOTO_FORM_FIELD);
    if (!(file instanceof File)) throw new Error('No photo field');
    return {
        fileName: file.name,
        contentType: file.type,
        bytes: new Uint8Array(await file.arrayBuffer()),
    };
}
