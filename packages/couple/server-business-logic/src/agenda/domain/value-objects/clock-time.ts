const CLOCK_TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

// An hour of the day on the Paris wall clock, written HH:MM (decision 0047); two of them compare as strings.
export const isClockTime = (value: string): boolean =>
    CLOCK_TIME_PATTERN.test(value);
