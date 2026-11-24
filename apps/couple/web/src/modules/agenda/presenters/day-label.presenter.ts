import { I18N_CONFIG } from '@/i18n/config';
import { yearOf } from './calendar-day.presenter';

// A day YYYY-MM-DD read at UTC midnight and written in UTC: no time zone can move it (decision 0047).
const DAY_TIME_ZONE = 'UTC';

const formatOf = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
        ...options,
        timeZone: DAY_TIME_ZONE,
    });

const LONG_DAY = formatOf({ weekday: 'long', day: 'numeric', month: 'long' });
const LONG_DAY_WITH_YEAR = formatOf({
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});
const SHORT_DAY = formatOf({ day: 'numeric', month: 'long' });
const SHORT_DAY_WITH_YEAR = formatOf({
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const atUtcMidnight = (day: string): number =>
    Date.parse(`${day}T00:00:00.000Z`);

const capitalize = (text: string): string =>
    text.charAt(0).toLocaleUpperCase(I18N_CONFIG.defaultLocale) + text.slice(1);

// "Mardi 24 novembre", with the year only when it is not the current one.
export const presentLongDay = (day: string, today: string): string =>
    capitalize(
        (yearOf(day) === yearOf(today) ? LONG_DAY : LONG_DAY_WITH_YEAR).format(
            atUtcMidnight(day),
        ),
    );

// "29 novembre", with the year only when it differs from the day it is read on.
export const presentShortDay = (day: string, readOn: string): string =>
    (yearOf(day) === yearOf(readOn) ? SHORT_DAY : SHORT_DAY_WITH_YEAR).format(
        atUtcMidnight(day),
    );
