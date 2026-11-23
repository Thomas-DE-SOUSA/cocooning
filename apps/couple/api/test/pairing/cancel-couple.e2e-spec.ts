import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { CoupleCancelledEvent } from '@cocooning/couple-server-business-logic/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    coupleOf,
    NOW,
    PAIRING_SESSION_MISSING,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
    refusal,
} from './pairing-test-data';

describe('Feature: the single partner of a pending couple cancels it (R8)', () => {
    const pairing = new PairingTestApp();

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(() => pairing.reset());

    describe('Scenario: a pending couple', () => {
        it('answers 204, deletes the couple softly and releases the partner', async () => {
            const { coupleId } = coupleOf(
                await pairing.createCouple(PARTNER_A),
            );
            expect(await pairing.cancel(PARTNER_A)).toEqual({
                status: 204,
                body: null,
            });
            expect((await pairing.getMine(PARTNER_A)).status).toBe(404);
            const stored =
                await pairing.prisma.includingDeleted.couple.findFirst({
                    where: { id: coupleId },
                    include: { partners: true },
                });
            expect(stored).toMatchObject({
                deletedAt: NOW,
                partners: [],
            });
            const events = await readPairingEvents(pairing.prisma, coupleId);
            expect(events.at(-1)).toEqual({
                eventName: CoupleCancelledEvent.EVENT_NAME,
                coupleId,
                aggregateId: coupleId,
                userId: PARTNER_A,
                version: 2,
                published: false,
                eventData: null,
            });
            expect((await pairing.createCouple(PARTNER_A)).status).toBe(201);
        });

        it('makes its code worthless', async () => {
            const code = codeOf(await pairing.createCouple(PARTNER_A));
            await pairing.cancel(PARTNER_A);
            expect((await pairing.join(PARTNER_B, code)).status).toBe(422);
        });
    });

    describe('Scenario: both partners created a couple', () => {
        it('lets one cancel theirs and join the other', async () => {
            const code = codeOf(await pairing.createCouple(PARTNER_A));
            await pairing.createCouple(PARTNER_B);
            expect((await pairing.join(PARTNER_B, code)).status).toBe(409);
            await pairing.cancel(PARTNER_B);
            const joined = await pairing.join(PARTNER_B, code);
            expect(coupleOf(joined).pairingStatus).toBe('PAIRED');
        });
    });

    describe('Scenario: a paired couple', () => {
        it('refuses with 409', async () => {
            await pairing.join(
                PARTNER_B,
                codeOf(await pairing.createCouple(PARTNER_A)),
            );
            expect(await pairing.cancel(PARTNER_B)).toEqual(
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
            expect(await pairing.cancel(PARTNER_C)).toEqual(
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
                .delete(ApiRouterEnum.COUPLE_CANCEL);
            expect(response).toEqual(PAIRING_SESSION_MISSING);
        });
    });
});
