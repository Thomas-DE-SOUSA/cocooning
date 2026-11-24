import { I18N_CONFIG } from '@/i18n/config';

const DAY_MS = 86_400_000;

// en-CA writes a day as YYYY-MM-DD; the couple reads every time in Paris, on the server and on the phone alike.
const PARIS_DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: I18N_CONFIG.timeZone,
});

const PARIS_TIME_FORMAT = new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: I18N_CONFIG.timeZone,
});

export const presentParisDay = (instant: Date): string =>
    PARIS_DAY_FORMAT.format(instant);

// "14:32" from an ISO instant of the API.
export const presentParisTime = (instant: string): string =>
    PARIS_TIME_FORMAT.format(new Date(instant));

export const previousDayOf = (day: string): string =>
    new Date(Date.parse(`${day}T00:00:00.000Z`) - DAY_MS)
        .toISOString()
        .slice(0, 10);
