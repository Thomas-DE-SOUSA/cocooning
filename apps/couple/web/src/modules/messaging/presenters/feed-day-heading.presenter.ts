import { I18N_CONFIG } from '@/i18n/config';
import {
    type FeedDayHeading,
    FeedDayKindEnum,
} from '../view-models/message-feed.view-model';
import { previousDayOf } from './paris-time.presenter';

// A day YYYY-MM-DD read at UTC midnight and written in UTC: no time zone can move it.
const formatOf = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
        ...options,
        timeZone: 'UTC',
    });

const DAY_LABEL = formatOf({ weekday: 'long', day: 'numeric', month: 'long' });
const DAY_LABEL_WITH_YEAR = formatOf({
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
});

const capitalize = (text: string): string =>
    text.charAt(0).toLocaleUpperCase(I18N_CONFIG.defaultLocale) + text.slice(1);

// "Aujourd'hui", "Hier", then "Mardi 24 novembre", with the year only when it is not the current one.
export function presentFeedDayHeading(
    day: string,
    today: string,
): FeedDayHeading {
    if (day === today) return { kind: FeedDayKindEnum.TODAY };
    if (day === previousDayOf(today)) {
        return { kind: FeedDayKindEnum.YESTERDAY };
    }
    const format =
        day.slice(0, 4) === today.slice(0, 4) ? DAY_LABEL : DAY_LABEL_WITH_YEAR;
    return {
        kind: FeedDayKindEnum.DATE,
        label: capitalize(format.format(Date.parse(`${day}T00:00:00.000Z`))),
    };
}
