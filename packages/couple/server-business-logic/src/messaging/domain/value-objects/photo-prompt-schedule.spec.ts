import { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { drawPhotoPromptTime } from './photo-prompt-schedule';

// Records the range asked for, and answers the given end of it.
class RangeRecordingRandom extends SecureRandomGenerator {
    ranges: ReadonlyArray<readonly [number, number]> = [];

    constructor(private readonly answer: 'first' | 'last') {
        super();
    }

    override generateHex(): string {
        return '';
    }

    override generateInteger(
        minInclusive: number,
        maxExclusive: number,
    ): number {
        this.ranges = [...this.ranges, [minInclusive, maxExclusive]];
        return this.answer === 'first' ? minInclusive : maxExclusive - 1;
    }
}

describe('Feature: the time of the photo prompt is drawn between 9:00 and 21:00 Paris (R7)', () => {
    it('draws a minute of the day from 9:00 included to 21:00 excluded', () => {
        const random = new RangeRecordingRandom('first');
        drawPhotoPromptTime('2026-11-24', random);
        expect(random.ranges).toEqual([[540, 1260]]);
    });

    it.each([
        [
            'the first minute, 9:00 in winter',
            'first',
            '2026-11-24',
            '2026-11-24T08:00:00.000Z',
        ],
        [
            'the last minute, 20:59 in winter',
            'last',
            '2026-11-24',
            '2026-11-24T19:59:00.000Z',
        ],
        [
            'the first minute, 9:00 of the spring day that changes hour',
            'first',
            '2027-03-28',
            '2027-03-28T07:00:00.000Z',
        ],
        [
            'the last minute, 20:59 of the autumn day that changes hour',
            'last',
            '2026-10-25',
            '2026-10-25T19:59:00.000Z',
        ],
    ] as const)('places %s', (_label, answer, day, instant) => {
        expect(
            drawPhotoPromptTime(day, new RangeRecordingRandom(answer)),
        ).toEqual(new Date(instant));
    });
});
