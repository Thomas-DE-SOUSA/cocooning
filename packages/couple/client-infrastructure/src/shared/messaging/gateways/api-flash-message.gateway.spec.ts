import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { A_FLASH_MESSAGE } from '@cocooning/couple-client-business-logic/testing';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { FLASH_MESSAGE_TEXT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    aMessagingGateway,
    anApiRefusal,
    JSON_BODY,
    SESSION_COOKIE,
} from './__tests__/messaging-gateway-test.context';
import { ApiFlashMessageGateway } from './api-flash-message.gateway';

const MESSAGE_ID = A_FLASH_MESSAGE.id;
const aGateway = () => aMessagingGateway(ApiFlashMessageGateway);

describe('Feature: the PWA sends and withdraws flash messages through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it('sends the trimmed text as JSON with the session cookie (R2)', async () => {
        fakeFetch.givenResponse(201, JSON.stringify(A_FLASH_MESSAGE));
        await expect(
            aGateway().sendFlashMessage({ text: ' Je t aime ' }),
        ).resolves.toEqual(ok(A_FLASH_MESSAGE));
        expect(fakeFetch.calls).toEqual([
            {
                url: 'http://api.test/flash-messages',
                method: 'POST',
                headers: { ...JSON_BODY, ...SESSION_COOKIE },
                body: JSON.stringify({ text: 'Je t aime' }),
            },
        ]);
    });

    it.each([
        ['an empty text', '  '],
        ['a text too long', 'a'.repeat(FLASH_MESSAGE_TEXT_MAX_LENGTH + 1)],
    ])('refuses %s without calling the API (R2)', async (_label, text) => {
        const result = await aGateway().sendFlashMessage({ text });
        expect(result.success === false && result.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(fakeFetch.calls).toEqual([]);
    });

    it('withdraws a word from a 204 without body (R6)', async () => {
        fakeFetch.givenResponse(204, '');
        await expect(
            aGateway().withdrawFlashMessage(MESSAGE_ID),
        ).resolves.toEqual(ok(null));
        expect(fakeFetch.calls[0]).toMatchObject({
            url: `http://api.test/flash-messages/${MESSAGE_ID}`,
            method: 'DELETE',
            body: null,
        });
    });

    it('returns FORBIDDEN with the backend code for the word of the other (R6)', async () => {
        const code = MessagingExceptionCodeEnum.FLASH_MESSAGE_RESERVED_TO_OWNER;
        fakeFetch.givenResponse(403, anApiRefusal(403, code, 'Reserved'));
        await expect(
            aGateway().withdrawFlashMessage(MESSAGE_ID),
        ).resolves.toEqual(
            fail({
                code: ApiErrorCodeEnum.FORBIDDEN,
                message: 'Reserved',
                backendCode: code,
            }),
        );
    });
});
