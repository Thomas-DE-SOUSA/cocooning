import type { RecordTogetherPeriodsCommand } from '@cocooning/couple-server-business-logic/pairing';

type TogetherPeriodArgument = RecordTogetherPeriodsCommand['periods'][number];

const PERIOD_SEPARATOR = '..';

// Only the shape `<start>..<end>` or `<start>..` is read here: the domain decides whether the days are valid (R9).
const parsePeriod = (raw: string): TogetherPeriodArgument | null => {
    const [startedOn, endedOn, ...rest] = raw.split(PERIOD_SEPARATOR);
    if (startedOn === undefined || endedOn === undefined) return null;
    if (rest.length > 0) return null;
    return { startedOn, endedOn: endedOn === '' ? null : endedOn };
};

export function parseTogetherPeriods(
    rawPeriods: readonly string[],
): TogetherPeriodArgument[] | null {
    const periods = rawPeriods.map(parsePeriod);
    if (periods.some((period) => period === null)) return null;
    return periods.filter((period) => period !== null);
}
