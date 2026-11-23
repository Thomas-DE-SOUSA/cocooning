import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { CoupleCancelledEvent } from '../../domain/events/couple-cancelled.event';
import type { Couple } from '../../domain/models/couple.aggregate';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import {
    MILLISECONDS_PER_HOUR,
    NOW,
    PairingTestContext,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/pairing-test.context';

const CANCELLED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: cancel a pending couple', () => {
    let ctx: PairingTestContext;

    beforeEach(() => {
        ctx = new PairingTestContext();
    });
    afterEach(() => CoupleId.resetForTests());

    const cancel = (userId: string) =>
        ctx.cancelCoupleUseCase().execute({ userId });

    describe('Scenario: R8, the single partner of a pending couple cancels it', () => {
        let pending: Couple;

        beforeEach(() => {
            pending = ctx.givenPendingCoupleOf(PARTNER_A);
            ctx.advanceHours(1);
        });

        it('deletes the couple softly, at the instant of the cancellation', async () => {
            await cancel(PARTNER_A);
            expect(ctx.coupleRepository.storedSnapshots).toEqual([
                {
                    ...pending.toSnapshot(),
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: CANCELLED_AT.toISOString(),
                        deletedAt: CANCELLED_AT.toISOString(),
                    },
                },
            ]);
        });

        it('leaves the partner without a couple, free to create another', async () => {
            await cancel(PARTNER_A);
            await expect(
                ctx.getMyCoupleUseCase().execute({ userId: PARTNER_A }),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            });
            const view = await ctx
                .createCoupleUseCase()
                .execute({ userId: PARTNER_A });
            expect(view.pairingStatus).toBe(CouplePairingStatusEnum.PENDING);
        });

        it('makes its code worth nothing', async () => {
            const code = pending.invitationCode?.value ?? '';
            await cancel(PARTNER_A);
            await expect(
                ctx
                    .joinCoupleUseCase()
                    .execute({ userId: PARTNER_B }, { invitationCode: code }),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            });
        });

        it('persists then publishes one cancelled event, without the code', async () => {
            await cancel(PARTNER_A);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CoupleCancelledEvent.EVENT_NAME,
                aggregateId: pending.id.getValue(),
                context: { coupleId: pending.id.getValue(), userId: PARTNER_A },
                data: null,
                occurredAt: CANCELLED_AT,
            };
            expect(ctx.coupleRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                pending.invitationCode?.value,
            );
        });
    });

    describe('Scenario: R8, both partners created a couple, one cancels and joins the other', () => {
        it('forms the couple with the code of the other', async () => {
            const kept = ctx.givenPendingCoupleOf(PARTNER_A, 'AAAAAAAZ');
            ctx.givenPendingCoupleOf(PARTNER_B, 'AAAAAAAY');
            await cancel(PARTNER_B);
            const view = await ctx
                .joinCoupleUseCase()
                .execute({ userId: PARTNER_B }, { invitationCode: 'AAAAAAAZ' });
            expect(view).toMatchObject({
                coupleId: kept.id.getValue(),
                pairingStatus: CouplePairingStatusEnum.PAIRED,
            });
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the cancellation and its event, and logs one warning', async () => {
            ctx.givenPendingCoupleOf(PARTNER_A);
            ctx.eventPublisher.failWith(new Error('bus down'));
            await cancel(PARTNER_A);
            expect(
                ctx.coupleRepository.storedSnapshots[0]?.metadata.deletedAt,
            ).toBe(NOW.toISOString());
            expect(ctx.coupleRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });

    describe('Scenario: the partner has no couple', () => {
        it('answers that the couple is not found', async () => {
            await expect(cancel(PARTNER_A)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R8, the couple is already formed', () => {
        it.each([[PARTNER_A], [PARTNER_B]])(
            'refuses %p, and changes nothing',
            async (userId) => {
                ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
                await expect(cancel(userId)).rejects.toMatchObject({
                    code: PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED,
                });
                expect(ctx.coupleRepository.storedSnapshots[0]).toMatchObject({
                    version: 2,
                    metadata: { deletedAt: null },
                });
                expect(ctx.coupleRepository.persistedEvents).toEqual([]);
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });
});
