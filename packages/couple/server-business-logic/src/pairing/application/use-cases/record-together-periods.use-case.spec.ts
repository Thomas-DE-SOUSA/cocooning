import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { TogetherPeriodsRecordedEvent } from '../../domain/events/together-periods-recorded.event';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import {
    NOW,
    PairingTestContext,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
} from '../../__tests__/fixtures/pairing-test.context';

const FIRST = { startedOn: '2020-01-10', endedOn: '2021-03-04' };
const SECOND = { startedOn: '2022-05-01', endedOn: null };
const RECORDED_AT = new Date(NOW.getTime() + 60_000);

describe('Feature: record the together periods of the couple', () => {
    let ctx: PairingTestContext;

    beforeEach(() => {
        ctx = new PairingTestContext();
    });
    afterEach(() => CoupleId.resetForTests());

    const record = (
        userId: string,
        periods: ReadonlyArray<typeof FIRST | typeof SECOND>,
    ) =>
        ctx
            .recordTogetherPeriodsUseCase()
            .execute({ userId }, { periods: [...periods] });

    const expectNothingChanged = (version: number) => {
        expect(ctx.coupleRepository.storedSnapshots[0]).toMatchObject({
            togetherPeriods: [],
            version,
        });
        expect(ctx.coupleRepository.persistedEvents).toEqual([]);
        expect(ctx.eventPublisher.published).toEqual([]);
    };

    describe('Scenario: R9, a partner of a formed couple records its periods', () => {
        const givenPairedCouple = () => {
            const couple = ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            ctx.dateTimeProvider.setNow(RECORDED_AT);
            return couple;
        };

        it('stores the periods and returns them with the couple', async () => {
            const couple = givenPairedCouple();
            const view = await record(PARTNER_B, [FIRST, SECOND]);
            expect(view).toEqual({
                coupleId: couple.id.getValue(),
                pairingStatus: CouplePairingStatusEnum.PAIRED,
                partners: [
                    { userId: PARTNER_A, joinedAt: NOW },
                    { userId: PARTNER_B, joinedAt: NOW },
                ],
                invitationCode: null,
                togetherPeriods: [FIRST, SECOND],
            });
            expect(ctx.coupleRepository.storedSnapshots[0]).toMatchObject({
                togetherPeriods: [FIRST, SECOND],
                version: 3,
                metadata: { updatedAt: RECORDED_AT.toISOString() },
            });
        });

        it('replaces the previous list', async () => {
            givenPairedCouple();
            await record(PARTNER_A, [FIRST, SECOND]);
            const view = await record(PARTNER_A, [SECOND]);
            expect(view.togetherPeriods).toEqual([SECOND]);
        });

        it('persists then publishes one event that carries the count, never a day', async () => {
            const couple = givenPairedCouple();
            await record(PARTNER_A, [FIRST, SECOND]);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000004',
                eventName: TogetherPeriodsRecordedEvent.EVENT_NAME,
                aggregateId: couple.id.getValue(),
                context: { coupleId: couple.id.getValue(), userId: PARTNER_A },
                data: { periodCount: 2 },
                occurredAt: RECORDED_AT,
            };
            expect(ctx.coupleRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            const serialized = JSON.stringify(ctx.eventPublisher.published);
            expect(serialized).not.toContain('2020-01-10');
            expect(serialized).not.toContain('2022-05-01');
        });
    });

    describe('Scenario: R9, a period starts today, in Paris', () => {
        it('accepts the Paris day even when it is still the day before in UTC', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            ctx.dateTimeProvider.setNow(new Date('2026-11-23T23:30:00.000Z'));
            const today = { startedOn: '2026-11-24', endedOn: null };
            const view = await record(PARTNER_A, [today]);
            expect(view.togetherPeriods).toEqual([today]);
        });

        it('refuses the day after', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            const tomorrow = { startedOn: '2026-11-24', endedOn: null };
            await expect(record(PARTNER_A, [tomorrow])).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
            });
            expectNothingChanged(2);
        });
    });

    describe('Scenario: R9, the list breaks a rule', () => {
        it.each([
            ['an empty list', []],
            ['periods out of order', [SECOND, FIRST]],
            ['an open period before the last', [SECOND, SECOND]],
        ])('refuses %s, and changes nothing', async (_label, periods) => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            await expect(record(PARTNER_A, periods)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
            });
            expectNothingChanged(2);
        });
    });

    describe('Scenario: R9, the couple is still pending', () => {
        it('refuses with PAIRING_COUPLE_NOT_PAIRED, and changes nothing', async () => {
            ctx.givenPendingCoupleOf(PARTNER_A);
            await expect(record(PARTNER_A, [FIRST])).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_PAIRED,
            });
            expectNothingChanged(1);
        });
    });

    describe('Scenario: the partner has no couple', () => {
        it('answers that the couple is not found', async () => {
            await expect(record(PARTNER_A, [FIRST])).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: couple isolation (core.md rule 27)', () => {
        it('records the periods of the partner own couple only', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            const before = ctx.coupleRepository.storedSnapshots;
            await expect(record(PARTNER_C, [FIRST])).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            });
            expect(ctx.coupleRepository.storedSnapshots).toEqual(before);
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the periods and their event, and logs one warning', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            ctx.eventPublisher.failWith(new Error('bus down'));
            await record(PARTNER_A, [FIRST]);
            expect(
                ctx.coupleRepository.storedSnapshots[0]?.togetherPeriods,
            ).toEqual([FIRST]);
            expect(ctx.coupleRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });
});
