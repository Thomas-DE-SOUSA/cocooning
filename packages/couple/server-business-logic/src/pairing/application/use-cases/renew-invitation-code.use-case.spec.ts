import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { InvitationCodeRenewedEvent } from '../../domain/events/invitation-code-renewed.event';
import type { Couple } from '../../domain/models/couple.aggregate';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import {
    MILLISECONDS_PER_HOUR,
    NOW,
    PairingTestContext,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/pairing-test.context';

const OLD_CODE = 'AAAAAAAB';
const NEW_CODE = 'AAAAAAAC';
const RENEWED_AT = new Date(NOW.getTime() + 2 * MILLISECONDS_PER_HOUR);
const NEW_EXPIRY = new Date(RENEWED_AT.getTime() + 48 * MILLISECONDS_PER_HOUR);

describe('Feature: renew the invitation code', () => {
    let ctx: PairingTestContext;

    beforeEach(() => {
        ctx = new PairingTestContext();
    });
    afterEach(() => CoupleId.resetForTests());

    const renew = (userId: string) =>
        ctx.renewInvitationCodeUseCase().execute({ userId });

    describe('Scenario: R7, the creator of a pending couple asks for a new code', () => {
        let pending: Couple;

        beforeEach(() => {
            pending = ctx.givenPendingCoupleOf(PARTNER_A);
            ctx.advanceHours(2);
        });

        it('gives a new code whose 48 hours start again', async () => {
            const view = await renew(PARTNER_A);
            expect(view).toEqual({
                coupleId: pending.id.getValue(),
                pairingStatus: CouplePairingStatusEnum.PENDING,
                partners: [{ userId: PARTNER_A, joinedAt: NOW }],
                invitationCode: { value: NEW_CODE, expiresAt: NEW_EXPIRY },
                togetherPeriods: [],
            });
            expect(ctx.coupleRepository.storedSnapshots[0]).toMatchObject({
                invitationCode: {
                    value: NEW_CODE,
                    expiresAt: NEW_EXPIRY.toISOString(),
                },
                version: 2,
                metadata: { updatedAt: RENEWED_AT.toISOString() },
            });
        });

        it('makes the old code worth nothing and the new one work', async () => {
            await renew(PARTNER_A);
            await expect(
                ctx
                    .joinCoupleUseCase()
                    .execute(
                        { userId: PARTNER_B },
                        { invitationCode: OLD_CODE },
                    ),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            });
            const view = await ctx
                .joinCoupleUseCase()
                .execute({ userId: PARTNER_B }, { invitationCode: NEW_CODE });
            expect(view.pairingStatus).toBe(CouplePairingStatusEnum.PAIRED);
        });

        it('persists then publishes one renewed event, without either code', async () => {
            await renew(PARTNER_A);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: InvitationCodeRenewedEvent.EVENT_NAME,
                aggregateId: pending.id.getValue(),
                context: { coupleId: pending.id.getValue(), userId: PARTNER_A },
                data: null,
                occurredAt: RENEWED_AT,
            };
            expect(ctx.coupleRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            const serialized = JSON.stringify(ctx.eventPublisher.published);
            expect(serialized).not.toContain(OLD_CODE);
            expect(serialized).not.toContain(NEW_CODE);
        });
    });

    describe('Scenario: the partner has no couple', () => {
        it('answers that the couple is not found', async () => {
            await expect(renew(PARTNER_A)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R7, the couple is already formed', () => {
        it.each([[PARTNER_A], [PARTNER_B]])(
            'refuses %p a code, and changes nothing',
            async (userId) => {
                ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
                await expect(renew(userId)).rejects.toMatchObject({
                    code: PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED,
                });
                expect(ctx.coupleRepository.storedSnapshots[0]).toMatchObject({
                    invitationCode: null,
                    version: 2,
                });
                expect(ctx.coupleRepository.persistedEvents).toEqual([]);
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });
});
