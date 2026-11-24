import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
} from '../../__tests__/fixtures/messaging-test.data';
import {
    PHONE_OF_A,
    PHONE_OF_B,
} from '../../__tests__/fixtures/messaging-test.push-data';

const endpointsStored = (ctx: MessagingTestContext) =>
    ctx.pushSubscriptionRepository.storedSnapshots.map(
        ({ endpoint }) => endpoint,
    );

describe('Feature: a partner forgets the subscription of a phone', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
        ctx.givenPushSubscriptionOf(AS_A, PHONE_OF_A);
        ctx.givenPushSubscriptionOf(AS_B, PHONE_OF_B);
    });
    afterEach(() => FlashMessageId.resetForTests());

    const unsubscribe = (context: ExecutionContext, endpoint: string) =>
        ctx
            .unsubscribePushNotificationsUseCase()
            .execute(context, { endpoint });

    describe('Scenario: R11, my own phone', () => {
        it('forgets it for good and keeps the other phones', async () => {
            await unsubscribe(AS_A, PHONE_OF_A);
            expect(endpointsStored(ctx)).toEqual([PHONE_OF_B]);
        });
    });

    describe('Scenario: a subscription I cannot reach', () => {
        it.each([
            ['the phone of the other partner', AS_A, PHONE_OF_B],
            ['a phone of another couple', AS_STRANGER, PHONE_OF_A],
            ['an unknown phone', AS_A, 'https://push.example.test/unknown'],
        ])(
            'answers not found for %s, and forgets nothing',
            async (_label, context, endpoint) => {
                await expect(
                    unsubscribe(context, endpoint),
                ).rejects.toMatchObject({
                    code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_NOT_FOUND,
                });
                expect(endpointsStored(ctx)).toEqual([PHONE_OF_A, PHONE_OF_B]);
            },
        );
    });

    describe('Scenario: an endpoint that is no https address', () => {
        it('refuses it as invalid', async () => {
            await expect(unsubscribe(AS_A, 'phone')).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_INVALID,
            });
        });
    });
});
