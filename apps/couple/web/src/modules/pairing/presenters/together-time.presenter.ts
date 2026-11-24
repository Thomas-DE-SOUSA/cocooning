import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { I18N_CONFIG } from '@/i18n/config';
import type { TogetherTimeViewModel } from '../view-models/couple-overview.view-model';

const DAY_MS = 86_400_000;
const DAYS_PER_YEAR = 365.25;

// en-CA formats a day as YYYY-MM-DD, the shape of the together periods.
const CALENDAR_DAY_FORMAT = new Intl.DateTimeFormat('en-CA', {
    timeZone: I18N_CONFIG.timeZone,
});
const DAYS_FORMAT = new Intl.NumberFormat(I18N_CONFIG.defaultLocale);
const YEARS_FORMAT = new Intl.NumberFormat(I18N_CONFIG.defaultLocale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const daysBetween = (from: string, to: string): number =>
    Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);

// R9: the days of every together period, an open one up to today in Paris; null when none is recorded.
export function presentTogetherTime(
    periods: CoupleResponse['togetherPeriods'],
    now: Date,
): TogetherTimeViewModel | null {
    if (periods.length === 0) return null;
    const today = CALENDAR_DAY_FORMAT.format(now);
    const days = periods.reduce(
        (total, period) =>
            total + daysBetween(period.startedOn, period.endedOn ?? today),
        0,
    );
    return {
        days: DAYS_FORMAT.format(days),
        years: YEARS_FORMAT.format(days / DAYS_PER_YEAR),
    };
}
