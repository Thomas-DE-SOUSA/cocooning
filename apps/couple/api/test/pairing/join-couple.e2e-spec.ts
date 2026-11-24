import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import {
    CoupleCreatedEvent,
    CouplePairedEvent,
} from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    coupleOf,
    isoAt,
    PAIRING_SESSION_MISSING,
    PARTNER_A,
    PARTNER_B,
} from './pairing-test-data';

describe('Feature: the second partner joins with the code (R5, R6)', () => {
    const pairing = new PairingTestApp();
    let coupleId: string;
    let code: string;

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        const created = await pairing.createCouple(PARTNER_A);
        ({ coupleId } = coupleOf(created));
        code = codeOf(created);
        pairing.advanceHours(1);
    });

    describe('Scenario: a valid code', () => {
        it('answers 200 with the paired couple and no code left', async () => {
            const response = await pairing.join(PARTNER_B, code);
            expect(response).toEqual({
                status: 200,
                body: {
                    coupleId,
                    pairingStatus: 'PAIRED',
                    partners: [
                        { userId: PARTNER_A, joinedAt: isoAt(0) },
                        { userId: PARTNER_B, joinedAt: isoAt(1) },
                    ],
                    invitationCode: null,
                    togetherPeriods: [],
                },
            });
        });

        it('writes the paired event after the creation, without the code', async () => {
            await pairing.join(PARTNER_B, code);
            const events = await readPairingEvents(pairing.prisma, coupleId);
            expect(events).toEqual([
                expect.objectContaining({
                    eventName: CoupleCreatedEvent.EVENT_NAME,
                    version: 1,
                }),
                {
                    eventName: CouplePairedEvent.EVENT_NAME,
                    coupleId,
                    aggregateId: coupleId,
                    userId: PARTNER_B,
                    version: 2,
                    published: false,
                    eventData: {
                        partnerUserIds: [PARTNER_A, PARTNER_B],
                        pairingStatus: 'PAIRED',
                    },
                },
            ]);
            expect(JSON.stringify(events)).not.toContain(code);
        });
    });

    describe('Scenario: R3, the code typed in lowercase with spaces', () => {
        it('is accepted', async () => {
            const typed = `${code.slice(0, 4)} ${code.slice(4)}`.toLowerCase();
            const response = await pairing.join(PARTNER_B, ` ${typed} `);
            expect(response.status).toBe(200);
            expect(coupleOf(response).pairingStatus).toBe('PAIRED');
        });
    });

    describe('Scenario: an unusable body', () => {
        it('refuses a missing code with 422', async () => {
            const response = await pairing
                .as(PARTNER_B)
                .post(ApiRouterEnum.COUPLE_JOIN, {});
            expect(response).toEqual({
                status: 422,
                body: {
                    status: 422,
                    code: 'VALIDATION_FAILED',
                    message: 'Validation failed',
                    errors: [
                        {
                            path: 'invitationCode',
                            code: 'invalid_type',
                            message:
                                'Invalid input: expected string, received undefined',
                        },
                    ],
                },
            });
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await pairing
                .unauthenticated()
                .post(ApiRouterEnum.COUPLE_JOIN, { invitationCode: code });
            expect(response).toEqual(PAIRING_SESSION_MISSING);
        });
    });
});
