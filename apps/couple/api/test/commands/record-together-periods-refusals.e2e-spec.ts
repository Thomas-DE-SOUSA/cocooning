import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import { PairingTestApp } from '../pairing/pairing-test-app';
import {
    codeOf,
    coupleOf,
    PARTNER_A,
    PARTNER_B,
    PARTNER_C,
} from '../pairing/pairing-test-data';
import { refused } from './captured-output';
import {
    emailOf,
    FIRST_PERIOD,
    OPEN_PERIOD,
    runRecordTogetherPeriods,
} from './record-together-periods-test-data';

const USAGE =
    'Usage: record-together-periods <email address> <YYYY-MM-DD..YYYY-MM-DD | YYYY-MM-DD..>...\n';
const INVALID = refused(
    PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
    'Only the last together period may be open',
);

describe('Feature: the command refuses to record the together periods (R9)', () => {
    const pairing = new PairingTestApp();

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        const created = await pairing.createCouple(PARTNER_A);
        await pairing.join(PARTNER_B, codeOf(created));
    });

    const periodsOf = async (userId: string) =>
        coupleOf(await pairing.getMine(userId)).togetherPeriods;

    describe('Scenario: R9, the domain refuses, nothing is written', () => {
        it('refuses an open period before the last with exit 65', async () => {
            await expect(
                runRecordTogetherPeriods([
                    emailOf(PARTNER_A),
                    OPEN_PERIOD,
                    FIRST_PERIOD,
                ]),
            ).resolves.toEqual({
                exitCode: 65,
                output: '',
                errorOutput: INVALID,
            });
            await expect(periodsOf(PARTNER_A)).resolves.toEqual([]);
        });

        it('refuses a day that is not a day with exit 65', async () => {
            const run = await runRecordTogetherPeriods([
                emailOf(PARTNER_A),
                '2021-02-30..',
            ]);
            expect(run.exitCode).toBe(65);
            expect(run.errorOutput).toBe(
                refused(
                    PairingExceptionCodeEnum.PAIRING_TOGETHER_PERIODS_INVALID,
                    'Together period day is not a calendar day',
                ),
            );
        });

        it('refuses a couple still pending with exit 65', async () => {
            await pairing.createCouple(PARTNER_C);
            await expect(
                runRecordTogetherPeriods([emailOf(PARTNER_C), OPEN_PERIOD]),
            ).resolves.toMatchObject({
                exitCode: 65,
                errorOutput: refused(
                    PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_PAIRED,
                    'Couple not paired yet',
                ),
            });
        });

        it('refuses a partner without a couple with exit 65', async () => {
            await expect(
                runRecordTogetherPeriods([emailOf(PARTNER_C), OPEN_PERIOD]),
            ).resolves.toMatchObject({
                exitCode: 65,
                errorOutput: refused(
                    PairingExceptionCodeEnum.PAIRING_COUPLE_NOT_FOUND,
                    'Couple not found',
                ),
            });
        });
    });

    describe('Scenario: an unknown account', () => {
        it('exits 67 and writes nothing', async () => {
            await expect(
                runRecordTogetherPeriods([
                    'nobody@cocooning.test',
                    OPEN_PERIOD,
                ]),
            ).resolves.toEqual({
                exitCode: 67,
                output: '',
                errorOutput:
                    'Unknown account: no account has this email address\n',
            });
        });
    });

    describe('Scenario: a mistake on the command line', () => {
        it.each([
            ['no argument', []],
            ['no period', [emailOf(PARTNER_A)]],
            ['a day without its separator', [emailOf(PARTNER_A), '2022-05-01']],
            [
                'two separators',
                [emailOf(PARTNER_A), '2020-01-10..2021-03-04..'],
            ],
        ])('exits 64 with %s', async (_label, args) => {
            await expect(runRecordTogetherPeriods(args)).resolves.toEqual({
                exitCode: 64,
                output: '',
                errorOutput: USAGE,
            });
        });
    });
});
