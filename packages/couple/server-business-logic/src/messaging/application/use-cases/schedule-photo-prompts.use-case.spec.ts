import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { PhotoPromptDrawnEvent } from '../../domain/events/photo-prompt-drawn.event';
import { SCHEDULED_TASK_USER_ID } from '../../domain/events/photo-prompt-fact';
import { PhotoPromptIssuedEvent } from '../../domain/events/photo-prompt-issued.event';
import { PhotoPrompt } from '../../domain/models/photo-prompt.aggregate';
import { FlashMessageId } from '../../domain/value-objects/flash-message-id.vo';
import { MessagingTestContext } from '../../__tests__/fixtures/messaging-test.context';
import {
    COUPLE_ID,
    idNumber,
    NOW,
    OTHER_COUPLE_ID,
    PARTNER_A,
    PARTNER_B,
    STRANGER,
    TEN_AM,
    TEN_AM_MINUTE,
    TODAY,
} from '../../__tests__/fixtures/messaging-test.data';

const SEVEN_AM = new Date('2026-11-24T06:00:00.000Z');
const BY_THE_APP = { coupleId: COUPLE_ID, userId: SCHEDULED_TASK_USER_ID };

describe('Feature: the daily photo prompt is drawn, then issued (R7)', () => {
    let ctx: MessagingTestContext;

    beforeEach(() => {
        ctx = new MessagingTestContext();
        ctx.pairedCoupleProvider.givenPairedCouple(COUPLE_ID, [
            PARTNER_A,
            PARTNER_B,
        ]);
    });
    afterEach(() => FlashMessageId.resetForTests());

    const tick = () => ctx.schedulePhotoPromptsUseCase().execute();
    const fact = (eventId: string, eventName: string, occurredAt: Date) => ({
        eventId,
        eventName,
        aggregateId: idNumber(1),
        context: BY_THE_APP,
        data: null,
        occurredAt,
    });

    describe('Scenario: R7, the first tick of a Paris day', () => {
        beforeEach(async () => {
            ctx.dateTimeProvider.setNow(SEVEN_AM);
            ctx.secureRandomGenerator.willReturnIntegers([TEN_AM_MINUTE]);
            await tick();
        });

        it('draws the prompt of the day at the drawn minute, not issued yet', () => {
            expect(ctx.photoPromptRepository.storedSnapshots).toEqual([
                {
                    id: idNumber(1),
                    coupleId: COUPLE_ID,
                    day: TODAY,
                    scheduledAt: TEN_AM.toISOString(),
                    issuedAt: null,
                    version: 1,
                    metadata: {
                        createdAt: SEVEN_AM.toISOString(),
                        updatedAt: SEVEN_AM.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes one drawn event, without the drawn time', () => {
            const expected = [
                fact(idNumber(2), PhotoPromptDrawnEvent.EVENT_NAME, SEVEN_AM),
            ];
            expect(ctx.photoPromptRepository.persistedEvents).toEqual(expected);
            expect(ctx.eventPublisher.published).toEqual(expected);
        });

        it('draws nothing more on the next tick', async () => {
            ctx.dateTimeProvider.advanceBy(60_000);
            await tick();
            expect(ctx.photoPromptRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.photoPromptRepository.persistedEvents).toHaveLength(1);
        });
    });

    describe('Scenario: R7, the drawn time comes', () => {
        beforeEach(() => {
            ctx.dateTimeProvider.setNow(SEVEN_AM);
            ctx.givenPhotoPromptOf(COUPLE_ID, false);
        });

        it('waits one millisecond before it', async () => {
            ctx.dateTimeProvider.setNow(new Date(TEN_AM.getTime() - 1));
            await tick();
            expect(ctx.photoPromptRepository.storedSnapshots[0]?.issuedAt).toBe(
                null,
            );
            expect(ctx.eventPublisher.published).toEqual([]);
        });

        it('issues it exactly at it, once', async () => {
            ctx.dateTimeProvider.setNow(TEN_AM);
            await tick();
            ctx.dateTimeProvider.advanceBy(60_000);
            await tick();
            expect(ctx.photoPromptRepository.storedSnapshots).toMatchObject([
                {
                    issuedAt: TEN_AM.toISOString(),
                    version: 2,
                    metadata: { updatedAt: TEN_AM.toISOString() },
                },
            ]);
            const expected = [
                fact(idNumber(3), PhotoPromptIssuedEvent.EVENT_NAME, TEN_AM),
            ];
            expect(ctx.photoPromptRepository.persistedEvents).toEqual(expected);
            expect(ctx.eventPublisher.published).toEqual(expected);
        });
    });

    describe('Scenario: R7, the API starts after the drawn time', () => {
        it('draws and issues the prompt in the same tick', async () => {
            ctx.secureRandomGenerator.willReturnIntegers([TEN_AM_MINUTE]);
            await tick();
            expect(ctx.photoPromptRepository.storedSnapshots).toMatchObject([
                {
                    scheduledAt: TEN_AM.toISOString(),
                    issuedAt: NOW.toISOString(),
                    version: 1,
                },
            ]);
            expect(ctx.eventPublisher.published).toEqual([
                fact(idNumber(2), PhotoPromptDrawnEvent.EVENT_NAME, NOW),
                fact(idNumber(3), PhotoPromptIssuedEvent.EVENT_NAME, NOW),
            ]);
        });
    });

    describe('Scenario: R7, several couples and a new day', () => {
        it('draws one prompt per formed couple, the same day for both partners', async () => {
            ctx.pairedCoupleProvider.givenPairedCouple(OTHER_COUPLE_ID, [
                STRANGER,
            ]);
            ctx.dateTimeProvider.setNow(SEVEN_AM);
            await tick();
            expect(
                ctx.photoPromptRepository.storedSnapshots.map(
                    ({ coupleId, day }) => ({ coupleId, day }),
                ),
            ).toEqual([
                { coupleId: COUPLE_ID, day: TODAY },
                { coupleId: OTHER_COUPLE_ID, day: TODAY },
            ]);
        });

        it('draws a new prompt after midnight, leaving yesterday as it was', async () => {
            ctx.givenPhotoPromptOf(COUPLE_ID);
            ctx.dateTimeProvider.setNow(new Date('2026-11-24T23:00:00.000Z'));
            await tick();
            expect(
                ctx.photoPromptRepository.storedSnapshots.map(
                    ({ day, version }) => ({ day, version }),
                ),
            ).toEqual([
                { day: TODAY, version: 1 },
                { day: '2026-11-25', version: 1 },
            ]);
        });

        it('saves and publishes nothing without a formed couple', async () => {
            FlashMessageId.resetForTests();
            ctx = new MessagingTestContext();
            await tick();
            expect(ctx.photoPromptRepository.storedSnapshots).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: two ticks overlap (a restart)', () => {
        it('refuses the second write of the day, and publishes nothing', async () => {
            ctx.dateTimeProvider.setNow(SEVEN_AM);
            const drawnElsewhere = PhotoPrompt.draw(
                { coupleId: COUPLE_ID, day: TODAY },
                ctx.secureRandomGenerator,
                SEVEN_AM,
            );
            ctx.photoPromptRepository.simulateConcurrentSave(drawnElsewhere);
            await expect(tick()).rejects.toMatchObject({
                code: MessagingExceptionCodeEnum.PHOTO_PROMPT_VERSION_CONFLICT,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the prompt and its event, and logs one warning', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            await tick();
            expect(ctx.photoPromptRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.photoPromptRepository.persistedEvents).toHaveLength(2);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
