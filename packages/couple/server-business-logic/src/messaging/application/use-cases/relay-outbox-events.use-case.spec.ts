import { PushNotificationKindEnum } from '@cocooning/couple-shared-kernel/enums';
import { FlashMessageSentEvent } from '../../domain/events/flash-message-sent.event';
import { FlashMessageWithdrawnEvent } from '../../domain/events/flash-message-withdrawn.event';
import { InstantPhotoSentEvent } from '../../domain/events/instant-photo-sent.event';
import { PhotoPromptIssuedEvent } from '../../domain/events/photo-prompt-issued.event';
import { PushDeliveryOutcomeEnum } from '../../domain/enums/push-delivery-outcome.enum';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NOW,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
} from '../../__tests__/fixtures/messaging-test.data';
import {
    outboxEventOf,
    PHONE_OF_A,
    PHONE_OF_B,
    PHONE_OF_STRANGER,
    TABLET_OF_B,
} from '../../__tests__/fixtures/messaging-test.push-data';

const BY_THE_APP = { ...AS_A, userId: '00000000-0000-0000-0000-000000000000' };
const MESSAGE = PushNotificationKindEnum.MESSAGE_RECEIVED;
const push = (endpoint: string, ownerId: string, kind: string) => ({
    endpoint,
    ownerId,
    kind,
});

describe('Feature: the outbox relay notifies the phones (R10, R11)', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
        ctx.givenPushSubscriptionOf(AS_A, PHONE_OF_A);
        ctx.givenPushSubscriptionOf(AS_B, PHONE_OF_B);
        ctx.givenPushSubscriptionOf(AS_B, TABLET_OF_B);
        ctx.givenPushSubscriptionOf(AS_STRANGER, PHONE_OF_STRANGER);
    });
    afterEach(() => FlashMessageId.resetForTests());

    const relay = () => ctx.relayOutboxEventsUseCase().execute();
    const endpointsStored = () =>
        ctx.pushSubscriptionRepository.storedSnapshots.map((s) => s.endpoint);

    describe('Scenario: R10, I send a word or a photo', () => {
        it.each([
            ['a flash message', FlashMessageSentEvent.EVENT_NAME],
            ['an instant photo', InstantPhotoSentEvent.EVENT_NAME],
        ])(
            'rings every phone of the other partner for %s, never mine',
            async (_label, eventName) => {
                ctx.outboxEventRepository.givenPending([
                    outboxEventOf(1, eventName, AS_A, { ownerId: PARTNER_A }),
                ]);
                await relay();
                expect(ctx.pushNotificationSender.sent).toEqual([
                    push(PHONE_OF_B, PARTNER_B, MESSAGE),
                    push(TABLET_OF_B, PARTNER_B, MESSAGE),
                ]);
            },
        );

        it('rings once for several words of one batch', async () => {
            ctx.outboxEventRepository.givenPending([
                outboxEventOf(1, FlashMessageSentEvent.EVENT_NAME, AS_B),
                outboxEventOf(2, FlashMessageSentEvent.EVENT_NAME, AS_B),
            ]);
            await relay();
            expect(ctx.pushNotificationSender.sent).toEqual([
                push(PHONE_OF_A, PARTNER_A, MESSAGE),
            ]);
        });
    });

    describe('Scenario: R10, the photo prompt of the day is issued', () => {
        it('rings the phones of both partners of the couple only', async () => {
            ctx.outboxEventRepository.givenPending([
                outboxEventOf(1, PhotoPromptIssuedEvent.EVENT_NAME, BY_THE_APP),
            ]);
            await relay();
            const kind = PushNotificationKindEnum.PHOTO_PROMPT_ISSUED;
            expect(ctx.pushNotificationSender.sent).toEqual([
                push(PHONE_OF_A, PARTNER_A, kind),
                push(PHONE_OF_B, PARTNER_B, kind),
                push(TABLET_OF_B, PARTNER_B, kind),
            ]);
        });
    });

    describe('Scenario: an event of another couple', () => {
        it('rings the phones of that couple only', async () => {
            ctx.outboxEventRepository.givenPending([
                outboxEventOf(1, PhotoPromptIssuedEvent.EVENT_NAME, {
                    ...AS_STRANGER,
                    userId: BY_THE_APP.userId,
                }),
            ]);
            await relay();
            expect(ctx.pushNotificationSender.sent).toEqual([
                push(
                    PHONE_OF_STRANGER,
                    STRANGER,
                    PushNotificationKindEnum.PHOTO_PROMPT_ISSUED,
                ),
            ]);
        });
    });

    describe('Scenario: an event that notifies nobody', () => {
        it.each([
            ['a withdrawn word', FlashMessageWithdrawnEvent.EVENT_NAME, null],
            ['an unknown event', 'unknown.thing.happened', null],
        ])(
            'sends nothing for %s, and marks it published',
            async (_label, eventName, data) => {
                ctx.outboxEventRepository.givenPending([
                    outboxEventOf(1, eventName, AS_A, data),
                ]);
                await relay();
                expect(ctx.pushNotificationSender.sent).toEqual([]);
                expect(ctx.outboxEventRepository.pendingEvents).toEqual([]);
            },
        );

        it('sends nothing when the other partner has no phone subscribed', async () => {
            ctx.outboxEventRepository.givenPending([
                outboxEventOf(1, FlashMessageSentEvent.EVENT_NAME, AS_STRANGER),
            ]);
            await relay();
            expect(ctx.pushNotificationSender.sent).toEqual([]);
            expect(ctx.outboxEventRepository.publishedEvents).toHaveLength(1);
        });
    });

    describe('Scenario: delivery, at least once', () => {
        it('marks every claimed event published at the time of the relay, in one transaction', async () => {
            const events = [
                outboxEventOf(1, FlashMessageSentEvent.EVENT_NAME, AS_A),
                outboxEventOf(2, FlashMessageWithdrawnEvent.EVENT_NAME, AS_A),
            ];
            ctx.outboxEventRepository.givenPending(events);
            await relay();
            expect(ctx.outboxEventRepository.publishedEvents).toEqual(
                events.map(({ eventId }) => ({ eventId, publishedAt: NOW })),
            );
            expect(ctx.unitOfWork.runCount).toBe(1);
        });

        it('claims a batch at most, the rest waits for the next relay', async () => {
            const events = [1, 2, 3, 4].map((n) =>
                outboxEventOf(n, FlashMessageWithdrawnEvent.EVENT_NAME, AS_A),
            );
            ctx.outboxEventRepository.givenPending(events);
            await relay();
            expect(ctx.outboxEventRepository.pendingEvents).toEqual([
                events[3],
            ]);
        });

        it('does nothing on an empty outbox', async () => {
            await relay();
            expect(ctx.pushNotificationSender.sent).toEqual([]);
            expect(ctx.outboxEventRepository.publishedEvents).toEqual([]);
        });

        it('leaves the batch unpublished when the sending breaks down', async () => {
            const event = outboxEventOf(
                1,
                FlashMessageSentEvent.EVENT_NAME,
                AS_A,
            );
            ctx.outboxEventRepository.givenPending([event]);
            ctx.pushNotificationSender.failWith(new Error('network down'));
            await expect(relay()).rejects.toThrow('network down');
            expect(ctx.outboxEventRepository.pendingEvents).toEqual([event]);
        });
    });

    describe('Scenario: R11, the push service refuses a subscription', () => {
        it('forgets a phone answered gone, keeps the others, publishes the batch', async () => {
            ctx.pushNotificationSender.willAnswer(
                TABLET_OF_B,
                PushDeliveryOutcomeEnum.GONE,
            );
            ctx.outboxEventRepository.givenPending([
                outboxEventOf(1, FlashMessageSentEvent.EVENT_NAME, AS_A),
                outboxEventOf(2, PhotoPromptIssuedEvent.EVENT_NAME, BY_THE_APP),
            ]);
            await relay();
            expect(endpointsStored()).toEqual([
                PHONE_OF_A,
                PHONE_OF_B,
                PHONE_OF_STRANGER,
            ]);
            expect(ctx.outboxEventRepository.pendingEvents).toEqual([]);
        });

        it('keeps a phone whose push failed otherwise, and never retries it', async () => {
            ctx.pushNotificationSender.willAnswer(
                PHONE_OF_B,
                PushDeliveryOutcomeEnum.FAILED,
            );
            ctx.outboxEventRepository.givenPending([
                outboxEventOf(1, FlashMessageSentEvent.EVENT_NAME, AS_A),
            ]);
            await relay();
            await relay();
            expect(endpointsStored()).toHaveLength(4);
            expect(ctx.pushNotificationSender.sent).toHaveLength(2);
            expect(ctx.outboxEventRepository.pendingEvents).toEqual([]);
        });
    });
});
