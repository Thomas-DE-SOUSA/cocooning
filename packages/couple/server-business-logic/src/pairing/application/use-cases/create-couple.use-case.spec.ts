import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { CoupleCreatedEvent } from '../../domain/events/couple-created.event';
import { Couple } from '../../domain/models/couple.aggregate';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import { InvitationCode } from '../../domain/value-objects/invitation-code.vo';
import {
    NOW,
    PairingTestContext,
    PARTNER_A,
    PARTNER_B,
} from '../../__tests__/fixtures/pairing-test.context';

const COUPLE_ID = '00000000-0000-7000-8000-000000000001';
const FIRST_CODE = 'AAAAAAAB';
const EXPIRES_AT = new Date('2026-11-25T10:00:00.000Z');

describe('Feature: create the couple', () => {
    let ctx: PairingTestContext;

    beforeEach(() => {
        ctx = new PairingTestContext();
    });
    afterEach(() => CoupleId.resetForTests());

    describe('Scenario: a partner without a couple creates one', () => {
        it('makes the creator the first partner of a pending couple with a 48-hour code', async () => {
            const view = await ctx
                .createCoupleUseCase()
                .execute({ userId: PARTNER_A });
            expect(view).toEqual({
                coupleId: COUPLE_ID,
                pairingStatus: CouplePairingStatusEnum.PENDING,
                partners: [{ userId: PARTNER_A, joinedAt: NOW }],
                invitationCode: { value: FIRST_CODE, expiresAt: EXPIRES_AT },
            });
        });

        it('saves the couple at its first version', async () => {
            await ctx.createCoupleUseCase().execute({ userId: PARTNER_A });
            expect(ctx.coupleRepository.storedSnapshots).toEqual([
                {
                    id: COUPLE_ID,
                    pairingStatus: CouplePairingStatusEnum.PENDING,
                    partners: [
                        { userId: PARTNER_A, joinedAt: NOW.toISOString() },
                    ],
                    invitationCode: {
                        value: FIRST_CODE,
                        expiresAt: EXPIRES_AT.toISOString(),
                    },
                    version: 1,
                    metadata: {
                        createdAt: NOW.toISOString(),
                        updatedAt: NOW.toISOString(),
                        deletedAt: null,
                    },
                },
            ]);
        });

        it('persists then publishes exactly one couple created event', async () => {
            await ctx.createCoupleUseCase().execute({ userId: PARTNER_A });
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000002',
                eventName: CoupleCreatedEvent.EVENT_NAME,
                aggregateId: COUPLE_ID,
                context: { coupleId: COUPLE_ID, userId: PARTNER_A },
                data: {
                    creatorUserId: PARTNER_A,
                    pairingStatus: CouplePairingStatusEnum.PENDING,
                },
                occurredAt: NOW,
            };
            expect(ctx.coupleRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });

        it('never puts the invitation code in an event', async () => {
            await ctx.createCoupleUseCase().execute({ userId: PARTNER_A });
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toContain(
                FIRST_CODE,
            );
        });
    });

    describe('Scenario: the in-process publication fails', () => {
        it('keeps the couple and its event for the outbox relay, without failing', async () => {
            ctx.eventPublisher.failWith(new Error('bus down'));
            const view = await ctx
                .createCoupleUseCase()
                .execute({ userId: PARTNER_A });
            expect(view.coupleId).toBe(COUPLE_ID);
            expect(ctx.coupleRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.coupleRepository.persistedEvents).toHaveLength(1);
            expect(ctx.logger.entries.map(({ level }) => level)).toEqual([
                'warn',
            ]);
        });
    });

    describe('Scenario: R1, the partner already created a couple', () => {
        it('refuses a second couple and changes nothing', async () => {
            ctx.givenPendingCoupleOf(PARTNER_A);
            await expect(
                ctx.createCoupleUseCase().execute({ userId: PARTNER_A }),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            });
            expect(ctx.coupleRepository.storedSnapshots).toHaveLength(1);
            expect(ctx.coupleRepository.persistedEvents).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R1, the partner joined someone else', () => {
        it('refuses to create a couple', async () => {
            ctx.givenPairedCoupleOf(PARTNER_A, PARTNER_B);
            await expect(
                ctx.createCoupleUseCase().execute({ userId: PARTNER_B }),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R1, the same partner creates two couples at once', () => {
        it('lets the unique partner constraint refuse the second one', async () => {
            const racing = Couple.create(
                {
                    creatorUserId: PARTNER_A,
                    invitationCode: InvitationCode.from({
                        value: 'ZZZZZZZZ',
                        expiresAt: EXPIRES_AT.toISOString(),
                    }),
                },
                NOW,
            );
            ctx.coupleRepository.simulateConcurrentSave(racing);
            await expect(
                ctx.createCoupleUseCase().execute({ userId: PARTNER_A }),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: another couple received the same code at the same time', () => {
        it('lets the unique code constraint refuse the couple', async () => {
            const racing = Couple.create(
                {
                    creatorUserId: PARTNER_B,
                    invitationCode: InvitationCode.from({
                        value: FIRST_CODE,
                        expiresAt: EXPIRES_AT.toISOString(),
                    }),
                },
                NOW,
            );
            ctx.coupleRepository.simulateConcurrentSave(racing);
            await expect(
                ctx.createCoupleUseCase().execute({ userId: PARTNER_A }),
            ).rejects.toMatchObject({
                code: PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });
});
