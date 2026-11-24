// R9: "today" is the day in Paris, where the couple lives, whatever the server's time zone.
export const COUPLE_TIME_ZONE = 'Europe/Paris';

const PARIS_DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: COUPLE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
});

// en-CA writes a day as YYYY-MM-DD.
export const coupleCalendarDayAt = (now: Date): string =>
    PARIS_DAY_FORMAT.format(now);
