// R7, R8: the day and the hours of the photo prompt are those of Paris, where the couple lives, whatever the server's time zone.
const COUPLE_TIME_ZONE = 'Europe/Paris';

const MILLISECONDS_PER_MINUTE = 60_000;
export const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

const PARIS_WALL_CLOCK = new Intl.DateTimeFormat('en-CA', {
    timeZone: COUPLE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
});

type WallClock = Record<'year' | 'month' | 'day' | 'hour' | 'minute', string>;

// formatToParts always gives these five parts for the options above.
const parisWallClockAt = (instant: Date | number): WallClock =>
    Object.fromEntries(
        PARIS_WALL_CLOCK.formatToParts(instant).map(({ type, value }) => [
            type,
            value,
        ]),
    ) as WallClock;

// How far the Paris wall clock is ahead of UTC at an instant: one hour in winter, two in summer.
const parisOffsetAt = (instant: number): number => {
    const { year, month, day, hour, minute } = parisWallClockAt(instant);
    const wallClock = Date.UTC(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
    );
    return wallClock - (instant - (instant % MILLISECONDS_PER_MINUTE));
};

// The Paris day of an instant, written YYYY-MM-DD.
export const coupleCalendarDayAt = (now: Date): string => {
    const { year, month, day } = parisWallClockAt(now);
    return `${year}-${month}-${day}`;
};

// The instant a Paris wall clock shows a minute of a day YYYY-MM-DD; MINUTES_PER_DAY is the next midnight.
// The offset is read again at the first guess, so a day that changes hour (end of March, end of October) lands right.
export const coupleInstantOf = (day: string, minuteOfDay: number): Date => {
    const wallClock = Date.UTC(
        Number(day.slice(0, 4)),
        Number(day.slice(5, 7)) - 1,
        Number(day.slice(8, 10)),
        0,
        minuteOfDay,
    );
    const firstGuess = wallClock - parisOffsetAt(wallClock);
    return new Date(wallClock - parisOffsetAt(firstGuess));
};
