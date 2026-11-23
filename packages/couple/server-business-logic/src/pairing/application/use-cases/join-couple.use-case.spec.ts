import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { CouplePairedEvent } from '../../domain/events/couple-paired.event';
import { Couple } from '../../domain/models/couple.aggregate';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import {
    INVITATION_CODE_LIFETIME_IN_HOURS,
    MILLISECONDS_PER_HOUR,
    NOW,
    PairingTestContext,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
} from '../../__tests__/fixtures/pairing-test.context';

const CODE = 'AAAAAAAB';
const JOINED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: join the couple', () => {
    let ctx: PairingTestContext;
    let pending: Couple;

    beforeEach(() => {
        ctx = new PairingTestContext();
        pending = ctx.givenPendingCoupleOf(PARTNER_A);
        ctx.advanceHours(1);
    });
    afterEach(() => CoupleId.resetForTests());

    const join = (userId: string, invitationCode: string) =>
        ctx.joinCoupleUseCase().execute({ userId }, { invitationCode });

    const expectRefusal = async (
        userId: string,
        invitationCode: string,
        code: string,
    ): Promise<void> => {
        await expect(join(userId, invitationCode)).rejects.toMatchObject({
            code,
        });
        expect(ctx.coupleRepository.persistedEvents).toEqual([]);
        expect(ctx.eventPublisher.published).toEqual([]);
        expect(ctx.coupleRepository.storedSnapshots[0]).toMatchObject({
            pairingStatus: CouplePairingStatusEnum.PENDING,
            invitationCode: { value: CODE },
            version: 1,
        });
    };

    describe('Scenario: R5, the other partner enters a valid code', () => {
        it('forms the couple, with both partners and no code left', async () => {
            const view = await join(PARTNER_B, CODE);
            expect(view).toEqual({
                coupleId: pending.id.getValue(),
                pairingStatus: CouplePairingStatusEnum.PAIRED,
                partners: [
                    { userId: PARTNER_A, joinedAt: NOW },
                    { userId: PARTNER_B, joinedAt: JOINED_AT },
                ],
                invitationCode: null,
            });
        });

        it('saves the paired couple and forgets the code', async () => {
            await join(PARTNER_B, CODE);
            expect(ctx.coupleRepository.storedSnapshots).toEqual([
                expect.objectContaining({
                    pairingStatus: CouplePairingStatusEnum.PAIRED,
                    invitationCode: null,
                    version: 2,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: JOINED_AT.toISOString(),
                        deletedAt: null,
                    },
                }),
            ]);
            await expect(
                ctx.coupleRepository.findByInvitationCode(CODE),
            ).resolves.toBeNull();
        });

        it('persists then publishes exactly one couple paired event, without the code', async () => {
            await join(PARTNER_B, CODE);
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: CouplePairedEvent.EVENT_NAME,
                aggregateId: pending.id.getValue(),
                context: { coupleId: pending.id.getValue(), userId: PARTNER_B },
                data: {
                    partnerUserIds: [PARTNER_A, PARTNER_B],
                    pairingStatus: CouplePairingStatusEnum.PAIRED,
                },
                occurredAt: JOINED_AT,
            };
            expect(ctx.coupleRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                CODE,
            );
        });
    });

    describe('Scenario: R3, the code is typed in lower case with spaces', () => {
        it('accepts it', async () => {
            const view = await join(PARTNER_B, ' aaaa aaab ');
            expect(view.pairingStatus).toBe(CouplePairingStatusEnum.PAIRED);
        });
    });

    describe('Scenario: R3, the code does not have the shape of a code', () => {
        it.each([
            ['AAAAAAA'],
            ['AAAAAAABB'],
            ['AAAAAAA0'],
            ['AAAAAAAO'],
            ['AAAAAAA1'],
            ['AAAAAAAI'],
            ['AAAA-AAB'],
            [''],
        ])('refuses %p as an invalid code', (invitationCode) =>
            expectRefusal(
                PARTNER_B,
                invitationCode,
                PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            ),
        );
    });

    describe('Scenario: R6, the code is unknown', () => {
        it('refuses it as an invalid code', () =>
            expectRefusal(
                PARTNER_B,
                'ZZZZZZZZ',
                PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            ));
    });

    describe('Scenario: R4, the code expires after 48 hours', () => {
        it('still accepts it one millisecond before the deadline', async () => {
            ctx.dateTimeProvider.setNow(
                new Date(
                    NOW.getTime() +
                        INVITATION_CODE_LIFETIME_IN_HOURS *
                            MILLISECONDS_PER_HOUR -
                        1,
                ),
            );
            const view = await join(PARTNER_B, CODE);
            expect(view.pairingStatus).toBe(CouplePairingStatusEnum.PAIRED);
        });

        it('refuses it exactly at the deadline, as an invalid code', () => {
            ctx.dateTimeProvider.setNow(
                new Date(
                    NOW.getTime() +
                        INVITATION_CODE_LIFETIME_IN_HOURS *
                            MILLISECONDS_PER_HOUR,
                ),
            );
            return expectRefusal(
                PARTNER_B,
                CODE,
                PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            );
        });
    });

    describe('Scenario: R5, the code was already used', () => {
        it('refuses a third partner as with an unknown code', async () => {
            await join(PARTNER_B, CODE);
            await expect(join(PARTNER_C, CODE)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
            });
            expect(ctx.eventPublisher.published).toHaveLength(1);
        });
    });

    describe('Scenario: R1, the creator enters the code of their own couple', () => {
        it('refuses them as already in a couple', () =>
            expectRefusal(
                PARTNER_A,
                CODE,
                PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            ));
    });

    describe('Scenario: R1, the joiner already belongs to another couple', () => {
        it('refuses them as already in a couple, whatever the code', async () => {
            ctx.givenPendingCoupleOf(PARTNER_B, 'ZZZZZZZZ');
            await expect(join(PARTNER_B, CODE)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            });
            await expect(join(PARTNER_B, 'not a code')).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: two partners enter the same code at the same time', () => {
        it('lets the version check refuse the second one', async () => {
            const firstJoiner = Couple.fromSnapshot(pending.toSnapshot());
            firstJoiner.join(PARTNER_C, CODE, ctx.dateTimeProvider.now());
            ctx.coupleRepository.simulateConcurrentSave(firstJoiner);
            await expect(join(PARTNER_B, CODE)).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
