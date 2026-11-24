import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    AN_INSTANT_PHOTO,
    AN_INSTANT_PHOTO_FILE,
    AN_INSTANT_PHOTO_UPLOAD,
} from '@cocooning/couple-client-business-logic/testing';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    ACCEPT,
    aMessagingGateway,
    anApiRefusal,
    SESSION_COOKIE,
    sentPhotoOf,
} from './__tests__/messaging-gateway-test.context';
import { ApiInstantPhotoGateway } from './api-instant-photo.gateway';

const PHOTO_ID = AN_INSTANT_PHOTO.id;
const FILE_URL = `http://api.test/instant-photos/${PHOTO_ID}/file`;
const aGateway = (token: string | null = 'session-token-1') =>
    aMessagingGateway(ApiInstantPhotoGateway, token);

describe('Feature: the PWA sends, reads and withdraws instant photos through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: R3, a photo of the phone camera', () => {
        it('sends it as multipart in the photo field, without a JSON content type', async () => {
            fakeFetch.givenResponse(201, JSON.stringify(AN_INSTANT_PHOTO));
            await expect(
                aGateway().sendInstantPhoto(AN_INSTANT_PHOTO_UPLOAD),
            ).resolves.toEqual(ok(AN_INSTANT_PHOTO));
            const [call] = fakeFetch.calls;
            expect(call).toMatchObject({
                url: 'http://api.test/instant-photos',
                method: 'POST',
                headers: { ...ACCEPT, ...SESSION_COOKIE },
            });
            await expect(sentPhotoOf(call!)).resolves.toEqual(
                AN_INSTANT_PHOTO_UPLOAD,
            );
        });

        it('returns the refusal of a photo the API cannot read', async () => {
            const code =
                MessagingExceptionCodeEnum.INSTANT_PHOTO_CONTENT_INVALID;
            fakeFetch.givenResponse(422, anApiRefusal(422, code, 'Invalid'));
            await expect(
                aGateway().sendInstantPhoto(AN_INSTANT_PHOTO_UPLOAD),
            ).resolves.toEqual(
                fail({
                    code: ApiErrorCodeEnum.VALIDATION_ERROR,
                    message: 'Invalid',
                    backendCode: code,
                }),
            );
        });
    });

    it('withdraws a photo from a 204 without body (R6)', async () => {
        fakeFetch.givenResponse(204, '');
        await expect(
            aGateway().withdrawInstantPhoto(PHOTO_ID),
        ).resolves.toEqual(ok(null));
        expect(fakeFetch.calls[0]).toMatchObject({
            url: `http://api.test/instant-photos/${PHOTO_ID}`,
            method: 'DELETE',
        });
    });

    describe('Scenario: R5, R9, the bytes of a photo', () => {
        it('reads the bytes and their format with the session cookie', async () => {
            const { bytes, contentType } = AN_INSTANT_PHOTO_FILE;
            fakeFetch.givenBytesResponse(200, bytes, contentType);
            await expect(
                aGateway().getInstantPhotoFile(PHOTO_ID),
            ).resolves.toEqual(ok(AN_INSTANT_PHOTO_FILE));
            expect(fakeFetch.calls).toEqual([
                {
                    url: FILE_URL,
                    method: 'GET',
                    headers: { Accept: '*/*', ...SESSION_COOKIE },
                    body: null,
                },
            ]);
        });

        it('reports a format outside R3 as an invalid response', async () => {
            fakeFetch.givenBytesResponse(200, new Uint8Array([1]), 'text/html');
            const result = await aGateway().getInstantPhotoFile(PHOTO_ID);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });

        it('returns NOT_FOUND for the hidden photo of the day of the other', async () => {
            const code = MessagingExceptionCodeEnum.INSTANT_PHOTO_NOT_FOUND;
            fakeFetch.givenResponse(404, anApiRefusal(404, code, 'Not found'));
            await expect(
                aGateway().getInstantPhotoFile(PHOTO_ID),
            ).resolves.toEqual(
                fail({
                    code: ApiErrorCodeEnum.NOT_FOUND,
                    message: 'Not found',
                    backendCode: code,
                }),
            );
        });

        it('refuses without calling the API when there is no session', async () => {
            const result = await aGateway(null).getInstantPhotoFile(PHOTO_ID);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
