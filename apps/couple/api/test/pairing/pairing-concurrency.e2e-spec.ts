import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import type { TestResponse } from '../shared/app/test-client';
import { PairingTestApp } from './pairing-test-app';
import {
    codeOf,
    coupleOf,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
    refusal,
} from './pairing-test-data';

const ROUNDS = 5;

const VERSION_CONFLICT = refusal(
    409,
    PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT,
    'Couple changed since it was read',
);
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

const losersOf = (responses: readonly TestResponse[], winner: number) =>
    responses.filter(({ status }) => status !== winner);

describe('Feature: concurrent writes on one couple', () => {
    const pairing = new PairingTestApp();

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(() => pairing.reset());

    // The loser read the couple before the winner committed: its updateMany finds version 1 gone (409).
    // It read after: the code is already cleared and the lookup finds nothing (422, R6).
    describe('Scenario: two partners enter the same code at once', () => {
        it.each(Array.from({ length: ROUNDS }, (_, round) => round + 1))(
            'lets exactly one in, round %i',
            async () => {
                await pairing.reset();
                const created = await pairing.createCouple(PARTNER_A);
                const { coupleId } = coupleOf(created);
                const code = codeOf(created);
                const responses = await Promise.all([
                    pairing.join(PARTNER_B, code),
                    pairing.join(PARTNER_C, code),
                ]);
                expect(
                    responses.filter(({ status }) => status === 200),
                ).toHaveLength(1);
                const [loser] = losersOf(responses, 200);
                expect([VERSION_CONFLICT, CODE_INVALID]).toContainEqual(loser);
                const stored = coupleOf(await pairing.getMine(PARTNER_A));
                expect(stored.partners).toHaveLength(2);
                const events = await readPairingEvents(
                    pairing.prisma,
                    coupleId,
                );
                expect(events.map(({ version }) => version)).toEqual([1, 2]);
            },
        );
    });

    // Both pass the precondition; the unique partner index refuses the second insert.
    describe('Scenario: R1, one partner creates two couples at once', () => {
        it('creates exactly one', async () => {
            const responses = await Promise.all([
                pairing.createCouple(PARTNER_A),
                pairing.createCouple(PARTNER_A),
            ]);
            expect(
                responses.filter(({ status }) => status === 201),
            ).toHaveLength(1);
            expect(losersOf(responses, 201)).toEqual([ALREADY_IN_COUPLE]);
        });
    });
});
