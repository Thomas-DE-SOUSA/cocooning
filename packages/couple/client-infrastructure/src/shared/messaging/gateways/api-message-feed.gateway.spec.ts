import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_FLASH_MESSAGE,
    A_MESSAGE_FEED_PAGE,
} from '@cocooning/couple-client-business-logic/testing';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    ACCEPT,
    aMessagingGateway,
    anApiRefusal,
    SESSION_COOKIE,
} from './__tests__/messaging-gateway-test.context';
import { ApiMessageFeedGateway } from './api-message-feed.gateway';

const aGateway = (token: string | null = 'session-token-1') =>
    aMessagingGateway(ApiMessageFeedGateway, token);

describe('Feature: the PWA reads the message feed through the API (R5)', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('reads the first page without a cursor, with the session cookie', async () => {
        fakeFetch.givenResponse(200, JSON.stringify(A_MESSAGE_FEED_PAGE));
        await expect(
            aGateway().listMessageFeed({ cursor: null, limit: 25 }),
        ).resolves.toEqual(ok(A_MESSAGE_FEED_PAGE));
        expect(fakeFetch.calls).toEqual([
            {
                url: 'http://api.test/message-feed?limit=25',
                method: 'GET',
                headers: { ...ACCEPT, ...SESSION_COOKIE },
                body: null,
            },
        ]);
    });

    it('reads the next page after the cursor', async () => {
        fakeFetch.givenResponse(200, JSON.stringify(A_MESSAGE_FEED_PAGE));
        await aGateway().listMessageFeed({
            cursor: A_FLASH_MESSAGE.id,
            limit: 10,
        });
        expect(fakeFetch.calls[0]?.url).toBe(
            `http://api.test/message-feed?limit=10&cursor=${A_FLASH_MESSAGE.id}`,
        );
    });

    it('returns NOT_FOUND with the backend code when the couple is not formed (R4)', async () => {
        const code = MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED;
        fakeFetch.givenResponse(404, anApiRefusal(404, code, 'Not paired'));
        await expect(
            aGateway().listMessageFeed({ cursor: null, limit: 25 }),
        ).resolves.toEqual(
            fail({
                code: ApiErrorCodeEnum.NOT_FOUND,
                message: 'Not paired',
                backendCode: code,
            }),
        );
    });

    it('reports a page outside the contract as an invalid response', async () => {
        fakeFetch.givenResponse(200, JSON.stringify({ items: [{}] }));
        const result = await aGateway().listMessageFeed({
            cursor: null,
            limit: 25,
        });
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.INVALID_RESPONSE,
        );
    });

    it('refuses a cursor that is not an id without calling the API', async () => {
        const result = await aGateway().listMessageFeed({
            cursor: 'abc',
            limit: 25,
        });
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(fakeFetch.calls).toEqual([]);
    });

    it('refuses without calling the API when there is no session', async () => {
        const result = await aGateway(null).listMessageFeed({
            cursor: null,
            limit: 25,
        });
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.UNAUTHORIZED,
        );
        expect(fakeFetch.calls).toEqual([]);
    });
});
