import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { ApiRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    coupleOf,
    PAIRING_SESSION_MISSING,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
    PARTNER_D,
    refusal,
} from './pairing-test-data';

const COUPLE_NOT_FOUND = refusal(
    404,
    PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
    'Couple not found',
);

describe('Feature: a partner reads their couple', () => {
    const pairing = new PairingTestApp();

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(() => pairing.reset());

    const pairCouple = async (creator: string, joiner: string) => {
        const created = await pairing.createCouple(creator);
        return coupleOf(await pairing.join(joiner, codeOf(created)));
    };

    describe('Scenario: a paired couple', () => {
        it('answers 200 with the same couple to both partners', async () => {
            const couple = await pairCouple(PARTNER_A, PARTNER_B);
            expect(await pairing.getMine(PARTNER_A)).toEqual({
                status: 200,
                body: couple,
            });
            expect(await pairing.getMine(PARTNER_B)).toEqual({
                status: 200,
                body: couple,
            });
        });
    });

    describe('Scenario: a pending couple', () => {
        it('shows its code to the creator, so the invitation screen can show it', async () => {
            const created = await pairing.createCouple(PARTNER_A);
            expect(await pairing.getMine(PARTNER_A)).toEqual({
                status: 200,
                body: created.body,
            });
        });
    });

    describe('Scenario: couple isolation (core.md rule 27)', () => {
        it('gives each partner their own couple, never the other one', async () => {
            const first = await pairCouple(PARTNER_A, PARTNER_B);
            const second = await pairCouple(PARTNER_C, PARTNER_D);
            const seenByC = coupleOf(await pairing.getMine(PARTNER_C));
            expect(seenByC).toEqual(second);
            expect(seenByC.coupleId).not.toBe(first.coupleId);
        });
    });

    describe('Scenario: a partner without a couple', () => {
        it('refuses with 404, the app shows the invitation screen', async () => {
            await pairCouple(PARTNER_A, PARTNER_B);
            expect(await pairing.getMine(PARTNER_C)).toEqual(COUPLE_NOT_FOUND);
        });
    });

    describe('Scenario: no session cookie', () => {
        it('refuses with 401', async () => {
            const response = await pairing
                .unauthenticated()
                .get(ApiRouterEnum.COUPLE_GET_MINE);
            expect(response).toEqual(PAIRING_SESSION_MISSING);
        });
    });
});
