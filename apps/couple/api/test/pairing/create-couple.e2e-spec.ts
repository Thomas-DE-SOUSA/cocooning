import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CoupleCreatedEvent } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    coupleOf,
    INVITATION_CODE_PATTERN,
    isoAt,
    PAIRING_SESSION_MISSING,
    PARTNER_A,
    refusal,
    UUID_PATTERN,
} from './pairing-test-data';

describe('Feature: a partner creates the couple (R2)', () => {
    const pairing = new PairingTestApp();

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(() => pairing.reset());

    describe('Scenario: a partner without a couple', () => {
        it('answers 201 with a pending couple and a code valid 48 hours', async () => {
            const response = await pairing.createCouple(PARTNER_A);
            expect(response).toEqual({
                status: 201,
                body: {
                    coupleId: expect.stringMatching(UUID_PATTERN),
                    pairingStatus: 'PENDING',
                    partners: [{ userId: PARTNER_A, joinedAt: isoAt(0) }],
                    invitationCode: {
                        value: expect.stringMatching(INVITATION_CODE_PATTERN),
                        expiresAt: isoAt(48),
                    },
                    togetherPeriods: [],
                },
            });
        });

        it('writes the creation event to the outbox, without the code', async () => {
            const response = await pairing.createCouple(PARTNER_A);
            const { coupleId } = coupleOf(response);
            const events = await readPairingEvents(pairing.prisma, coupleId);
            expect(events).toEqual([
                {
                    eventName: CoupleCreatedEvent.EVENT_NAME,
                    coupleId,
                    aggregateId: coupleId,
                    userId: PARTNER_A,
                    version: 1,
                    published: false,
                    eventData: {
                        creatorUserId: PARTNER_A,
                        pairingStatus: 'PENDING',
                    },
                },
            ]);
            expect(JSON.stringify(events)).not.toContain(codeOf(response));
        });
    });

    describe('Scenario: R1, a partner who already has a couple', () => {
        it('refuses a second couple with 409', async () => {
            await pairing.createCouple(PARTNER_A);
            const response = await pairing.createCouple(PARTNER_A);
            expect(response).toEqual(
                refusal(
                    409,
                    PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
                    'Partner already in a couple',
                ),
            );
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await pairing
                .unauthenticated()
                .post(ApiRouterEnum.COUPLE_CREATE);
            expect(response).toEqual(PAIRING_SESSION_MISSING);
        });
    });
});
