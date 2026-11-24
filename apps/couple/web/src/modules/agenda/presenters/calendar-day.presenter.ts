import { I18N_CONFIG } from '@/i18n/config';

const DAY_MS = 86_400_000;
const DAYS_PER_WEEK = 7;

// en-CA formats a day as YYYY-MM-DD, the shape of the agenda days (decision 0047).
const PARIS_DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: I18N_CONFIG.timeZone,
});

const toUtcMidnight = (day: string): number =>
    Date.parse(`${day}T00:00:00.000Z`);

const fromUtcMidnight = (time: number): string =>
    new Date(time).toISOString().slice(0, 10);

export const presentToday = (now: Date): string => PARIS_DAY_FORMAT.format(now);

export const addDays = (day: string, days: number): string =>
    fromUtcMidnight(toUtcMidnight(day) + days * DAY_MS);

// 0 for Monday to 6 for Sunday: the agenda weeks start on Monday.
export const weekdayIndexOf = (day: string): number =>
    (new Date(toUtcMidnight(day)).getUTCDay() + DAYS_PER_WEEK - 1) %
    DAYS_PER_WEEK;

export const monthOf = (day: string): string => day.slice(0, 7);

export const yearOf = (dayOrMonth: string): number =>
    Number(dayOrMonth.slice(0, 4));

export const firstDayOf = (month: string): string => `${month}-01`;

export const addMonths = (month: string, months: number): string =>
    monthOf(
        fromUtcMidnight(
            Date.UTC(yearOf(month), Number(month.slice(5, 7)) - 1 + months),
        ),
    );
