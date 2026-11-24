import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import {
    MILLISECONDS_PER_HOUR,
    NOW,
    PairingTestContext,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
} from '../../__tests__/fixtures/pairing-test.context';

describe('Feature: see my couple', () => {
    let ctx: PairingTestContext;

    beforeEach(() => {
        ctx = new PairingTestContext();
    });
    afterEach(() => CoupleId.resetForTests());

    const getMyCouple = (userId: string) =>
        ctx.getMyCoupleUseCase().execute({ userId });

    describe('Scenario: the partner has no couple yet', () => {
        it('answers that the couple is not found, so the app shows the invitation screen', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            await expect(getMyCouple(PARTNER_C)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
            });
        });
    });

    describe('Scenario: the couple is pending', () => {
        it('shows the creator and the code to pass on', async () => {
            const pending = ctx.givenPendingCoupleOf(PARTNER_A);
            await expect(getMyCouple(PARTNER_A)).resolves.toEqual({
                coupleId: pending.id.getValue(),
                pairingStatus: CouplePairingStatusEnum.PENDING,
                partners: [{ userId: PARTNER_A, joinedAt: NOW }],
                invitationCode: {
                    value: 'AAAAAAAB',
                    expiresAt: new Date(
                        NOW.getTime() + 48 * MILLISECONDS_PER_HOUR,
                    ),
                },
                togetherPeriods: [],
            });
        });
    });

    describe('Scenario: the couple is formed', () => {
        it.each([[PARTNER_A], [PARTNER_B]])(
            'shows %p both partners and no code',
            async (userId) => {
                const paired = ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
                await expect(getMyCouple(userId)).resolves.toEqual({
                    coupleId: paired.id.getValue(),
                    pairingStatus: CouplePairingStatusEnum.PAIRED,
                    partners: [
                        { userId: PARTNER_A, joinedAt: NOW },
                        { userId: PARTNER_B, joinedAt: NOW },
                    ],
                    invitationCode: null,
                    togetherPeriods: [],
                });
            },
        );

        it('records and publishes nothing', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            await getMyCouple(PARTNER_A);
            expect(ctx.coupleRepository.persistedEvents).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
