import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_MESSAGE_FEED_PAGE,
    A_TODAY_PHOTO_PROMPT,
} from '@cocooning/couple-client-business-logic/testing';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { MessagesStepEnum } from '../view-models/message-feed.view-model';
import { presentMessagesPage } from './messages-page.presenter';

const NOW = new Date('2026-11-24T22:30:00.000Z');
const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null,
): ApiError => ({ code, message: 'Refused', backendCode });

describe('Feature: the messages page (decision 0036)', () => {
    it('gives the first page, the Paris day and the prompt card', () => {
        const page = presentMessagesPage({
            feed: ok(A_MESSAGE_FEED_PAGE),
            prompt: ok(A_TODAY_PHOTO_PROMPT),
            now: NOW,
        });

        expect(page).toMatchObject({
            redirectTo: null,
            viewModel: {
                step: MessagesStepEnum.FEED,
                today: '2026-11-24',
                firstPage: A_MESSAGE_FEED_PAGE,
                promptCard: { issuedAt: '15:00', minutesBeforeLate: null },
            },
        });
    });

    it.each([
        [
            'a refused session goes to sign-in',
            aRefusal(ApiErrorCodeEnum.UNAUTHORIZED, null),
            WebRouterEnum.ACCOUNT_SIGN_IN,
        ],
        [
            'R4, no couple goes to the pairing',
            aRefusal(
                ApiErrorCodeEnum.NOT_FOUND,
                MessagingExceptionCodeEnum.MESSAGING_COUPLE_NOT_PAIRED,
            ),
            WebRouterEnum.COUPLE_PAIRING,
        ],
    ])('%s', (_label, error, route) => {
        expect(
            presentMessagesPage({
                feed: fail(error),
                prompt: ok(A_TODAY_PHOTO_PROMPT),
                now: NOW,
            }).redirectTo,
        ).toBe(route);
    });

    it('says the messages are unavailable when the prompt cannot be read', () => {
        const error = aRefusal(ApiErrorCodeEnum.NETWORK_ERROR, null);

        expect(
            presentMessagesPage({
                feed: ok(A_MESSAGE_FEED_PAGE),
                prompt: fail(error),
                now: NOW,
            }),
        ).toEqual({
            redirectTo: null,
            viewModel: { step: MessagesStepEnum.UNAVAILABLE, error },
        });
    });
});
