import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { InvitationCodeRenewedEvent } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    coupleOf,
    INVITATION_CODE_PATTERN,
    isoAt,
    PAIRING_SESSION_MISSING,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
    refusal,
} from './pairing-test-data';

describe('Feature: the creator renews the invitation code (R7)', () => {
    const pairing = new PairingTestApp();
    let coupleId: string;
    let previousCode: string;

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        const created = await pairing.createCouple(PARTNER_A);
        ({ coupleId } = coupleOf(created));
        previousCode = codeOf(created);
        pairing.advanceHours(2);
    });

    describe('Scenario: a pending couple', () => {
        it('answers 200 with a new code whose deadline starts again', async () => {
            const response = await pairing.renew(PARTNER_A);
            expect(response).toEqual({
                status: 200,
                body: {
                    coupleId,
                    pairingStatus: 'PENDING',
                    partners: [{ userId: PARTNER_A, joinedAt: isoAt(0) }],
                    invitationCode: {
                        value: expect.stringMatching(INVITATION_CODE_PATTERN),
                        expiresAt: isoAt(50),
                    },
                },
            });
            expect(codeOf(response)).not.toBe(previousCode);
        });

        it('makes the previous code worthless and the new one work', async () => {
            const renewed = codeOf(await pairing.renew(PARTNER_A));
            expect(await pairing.join(PARTNER_B, previousCode)).toEqual(
                refusal(
                    422,
                    PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
                    'Invalid invitation code',
                ),
            );
            expect((await pairing.join(PARTNER_B, renewed)).status).toBe(200);
        });

        it('writes an event without data, so without the code', async () => {
            const renewed = codeOf(await pairing.renew(PARTNER_A));
            const events = await readPairingEvents(pairing.prisma, coupleId);
            expect(events.at(-1)).toEqual({
                eventName: InvitationCodeRenewedEvent.EVENT_NAME,
                coupleId,
                aggregateId: coupleId,
                userId: PARTNER_A,
                version: 2,
                published: false,
                eventData: null,
            });
            expect(JSON.stringify(events)).not.toContain(renewed);
        });
    });

    describe('Scenario: a paired couple', () => {
        it('refuses with 409, a paired couple has no code', async () => {
            await pairing.join(PARTNER_B, previousCode);
            const response = await pairing.renew(PARTNER_A);
            expect(response).toEqual(
                refusal(
                    409,
                    PairingExceptionCodeEnum.PAIRING_COUPLE_ALREADY_PAIRED,
                    'Couple already paired',
                ),
            );
        });
    });

    describe('Scenario: a partner without a couple', () => {
        it('refuses with 404', async () => {
            const response = await pairing.renew(PARTNER_C);
            expect(response).toEqual(
                refusal(
                    404,
                    PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
                    'Couple not found',
                ),
            );
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await pairing
                .unauthenticated()
                .post(ApiRouterEnum.COUPLE_INVITATION_CODE_RENEW);
            expect(response).toEqual(PAIRING_SESSION_MISSING);
        });
    });
});
