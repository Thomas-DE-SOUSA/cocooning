import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    AGENDA_NAMESPACE,
    AGENDA_SCREEN_ERROR_CODES,
} from './agenda-i18n-namespaces';

const REQUIRED_KEYS = [
    'title',
    'today',
    'calendar.previousMonth',
    'calendar.nextMonth',
    'calendar.monthDropdown',
    'calendar.yearDropdown',
    'day.empty',
    'day.allDay',
    'event.until',
    'event.since',
    'event.mine',
    'event.partner',
    'event.private',
    'unavailable.title',
    'unavailable.refresh',
    ...[...AGENDA_SCREEN_ERROR_CODES, ...Object.values(ApiErrorCodeEnum)].map(
        (code) => `apiErrors.${code}`,
    ),
];

describe('Feature: messages of the agenda screen (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the screen and of the server errors in %s',
        (locale) => {
            const keys = flattenLocale(RESOURCES[locale][AGENDA_NAMESPACE]).map(
                ({ key }) => key,
            );

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
