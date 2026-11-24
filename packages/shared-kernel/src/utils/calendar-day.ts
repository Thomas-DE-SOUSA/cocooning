const CALENDAR_DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// A real day of the calendar, written YYYY-MM-DD: 2021-02-30 is refused.
export const isCalendarDay = (value: string): boolean => {
    if (!CALENDAR_DAY_PATTERN.test(value)) return false;
    const midnight = Date.parse(`${value}T00:00:00.000Z`);
    return (
        !Number.isNaN(midnight) &&
        new Date(midnight).toISOString().startsWith(value)
    );
};
