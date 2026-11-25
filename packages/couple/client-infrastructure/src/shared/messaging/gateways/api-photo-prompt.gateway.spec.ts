import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PHOTO_PROMPT_ID,
    A_TODAY_PHOTO_PROMPT,
    AN_INSTANT_PHOTO,
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
import { ApiPhotoPromptGateway } from './api-photo-prompt.gateway';

const PHOTO_OF_THE_DAY = {
    ...AN_INSTANT_PHOTO,
    photoPromptId: A_PHOTO_PROMPT_ID,
};
const aGateway = () => aMessagingGateway(ApiPhotoPromptGateway);

describe('Feature: the PWA reads and answers the photo prompt through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    it.each([
        ['the photo prompt of the day', A_TODAY_PHOTO_PROMPT],
        ['no photo prompt before it is issued', { photoPrompt: null }],
    ])('reads %s (R7)', async (_label, today) => {
        fakeFetch.givenResponse(200, JSON.stringify(today));
        await expect(aGateway().getTodayPhotoPrompt()).resolves.toEqual(
            ok(today),
        );
        expect(fakeFetch.calls).toEqual([
            {
                url: 'http://api.test/photo-prompts/today',
                method: 'GET',
                headers: { ...ACCEPT, ...SESSION_COOKIE },
                body: null,
            },
        ]);
    });

    it('answers with the photo as multipart, to the path of the prompt (R8)', async () => {
        fakeFetch.givenResponse(201, JSON.stringify(PHOTO_OF_THE_DAY));
        await expect(
            aGateway().answerPhotoPrompt(
                A_PHOTO_PROMPT_ID,
                AN_INSTANT_PHOTO_UPLOAD,
            ),
        ).resolves.toEqual(ok(PHOTO_OF_THE_DAY));
        const [call] = fakeFetch.calls;
        expect(call).toMatchObject({
            url: `http://api.test/photo-prompts/${A_PHOTO_PROMPT_ID}/instant-photos`,
            method: 'POST',
            headers: { ...ACCEPT, ...SESSION_COOKIE },
        });
        await expect(sentPhotoOf(call!)).resolves.toEqual(
            AN_INSTANT_PHOTO_UPLOAD,
        );
    });

    it('returns CONFLICT with the backend code after midnight (R8)', async () => {
        const code = MessagingExceptionCodeEnum.PHOTO_PROMPT_EXPIRED;
        fakeFetch.givenResponse(409, anApiRefusal(409, code, 'Expired'));
        await expect(
            aGateway().answerPhotoPrompt(
                A_PHOTO_PROMPT_ID,
                AN_INSTANT_PHOTO_UPLOAD,
            ),
        ).resolves.toEqual(
            fail({
                code: ApiErrorCodeEnum.CONFLICT,
                message: 'Expired',
                backendCode: code,
            }),
        );
    });
});
