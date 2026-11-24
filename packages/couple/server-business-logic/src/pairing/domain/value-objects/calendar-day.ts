// R9: "today" is the day in Paris, where the couple lives, whatever the server's time zone.
export const COUPLE_TIME_ZONE = 'Europe/Paris';

const CALENDAR_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const PARIS_DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: COUPLE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

// A real day of the calendar, written YYYY-MM-DD: 2021-02-30 is refused.
export const isCalendarDay = (value: string): boolean => {
    if (!CALENDAR_DAY_PATTERN.test(value)) return false;
    const midnight = Date.parse(`${value}T00:00:00.000Z`);
    return (
        !Number.isNaN(midnight) &&
        new Date(midnight).toISOString().startsWith(value)
    );
};

// en-CA writes a day as YYYY-MM-DD.
export const coupleCalendarDayAt = (now: Date): string =>
    PARIS_DAY_FORMAT.format(now);
