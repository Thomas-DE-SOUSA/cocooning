import { readPairingEvents } from '@cocooning/couple-e2e-shared/fixtures';
import { TogetherPeriodsRecordedEvent } from '@cocooning/couple-server-business-logic/pairing';
import { PairingTestApp } from '../pairing/pairing-test-app';
import {
    codeOf,
    coupleOf,
    PARTNER_A,
    PARTNER_B,
} from '../pairing/pairing-test-data';
import {
    emailOf,
    FIRST_PERIOD,
    OPEN_PERIOD,
    runRecordTogetherPeriods,
} from './record-together-periods-test-data';

const PERIODS = [
    { startedOn: '2020-01-10', endedOn: '2021-03-04' },
    { startedOn: '2022-05-01', endedOn: null },
];

// The command boots its own Nest context on the test database; the API proves both partners read the periods.
describe('Feature: the owner records the together periods on the VM (R9)', () => {
    const pairing = new PairingTestApp();
    let coupleId: string;

    beforeAll(() => pairing.start());
    afterAll(() => pairing.stop());
    beforeEach(async () => {
        await pairing.reset();
        const created = await pairing.createCouple(PARTNER_A);
        await pairing.join(PARTNER_B, codeOf(created));
        coupleId = coupleOf(created).coupleId;
    });

    describe('Scenario: R9, a partner of a formed couple and valid periods', () => {
        it('exits 0 without printing a day, and both partners read the periods', async () => {
            const run = await runRecordTogetherPeriods([
                ` ${emailOf(PARTNER_A).toUpperCase()} `,
                FIRST_PERIOD,
                OPEN_PERIOD,
            ]);
            expect(run).toEqual({
                exitCode: 0,
                output: 'Together periods recorded: 2 periods\n',
                errorOutput: '',
            });
            const seenByA = coupleOf(await pairing.getMine(PARTNER_A));
            const seenByB = coupleOf(await pairing.getMine(PARTNER_B));
            expect(seenByA.togetherPeriods).toEqual(PERIODS);
            expect(seenByB).toEqual(seenByA);
        });

        it('writes one outbox row that carries the count, never a day', async () => {
            await runRecordTogetherPeriods([emailOf(PARTNER_B), OPEN_PERIOD]);
            const events = await readPairingEvents(pairing.prisma, coupleId);
            expect(events.at(-1)).toEqual({
                eventName: TogetherPeriodsRecordedEvent.EVENT_NAME,
                coupleId,
                aggregateId: coupleId,
                userId: PARTNER_B,
                version: 3,
                published: false,
                eventData: { periodCount: 1 },
            });
        });

        it('replaces the previous list', async () => {
            await runRecordTogetherPeriods([
                emailOf(PARTNER_A),
                FIRST_PERIOD,
                OPEN_PERIOD,
            ]);
            await runRecordTogetherPeriods([emailOf(PARTNER_A), OPEN_PERIOD]);
            const couple = coupleOf(await pairing.getMine(PARTNER_A));
            expect(couple.togetherPeriods).toEqual([PERIODS[1]]);
        });
    });
});
