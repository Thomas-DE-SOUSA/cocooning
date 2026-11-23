import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
    refusal,
} from './pairing-test-data';

const CODE_INVALID = refusal(
    422,
    PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_INVALID,
    'Invalid invitation code',
);
const ALREADY_IN_COUPLE = refusal(
    409,
    PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE,
    'Partner already in a couple',
);

describe('Feature: a partner who may not join is refused (R1, R4, R6)', () => {
    const pairing = new PairingTestApp();
    let code: string;

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        const created = await pairing.createCouple(PARTNER_A);
        code = codeOf(created);
        pairing.advanceHours(1);
    });

    describe('Scenario: R6, a code that opens nothing', () => {
        it.each([
            ['an unknown code', () => 'ZZZZZZZZ'],
            ['a code with forbidden signs', () => 'IO01IO01'],
        ])('refuses %s with 422', async (_label, enteredCode) => {
            const response = await pairing.join(PARTNER_B, enteredCode());
            expect(response).toEqual(CODE_INVALID);
        });

        it('refuses an expired code with 422 (R4)', async () => {
            pairing.advanceHours(47);
            const response = await pairing.join(PARTNER_B, code);
            expect(response).toEqual(CODE_INVALID);
        });

        it('refuses a third partner with 422, since the code is gone', async () => {
            await pairing.join(PARTNER_B, code);
            const response = await pairing.join(PARTNER_C, code);
            expect(response).toEqual(CODE_INVALID);
        });
    });

    describe('Scenario: R1, a partner who already has a couple', () => {
        it('refuses the creator entering their own code with 409', async () => {
            const response = await pairing.join(PARTNER_A, code);
            expect(response).toEqual(ALREADY_IN_COUPLE);
        });

        it('refuses a partner of another couple with 409', async () => {
            await pairing.createCouple(PARTNER_B);
            const response = await pairing.join(PARTNER_B, code);
            expect(response).toEqual(ALREADY_IN_COUPLE);
        });
    });
});
