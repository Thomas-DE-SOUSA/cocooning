import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    AGENDA_NAMESPACE,
    AGENDA_SCREEN_ERROR_CODES,
} from './agenda-i18n-namespaces';
import {
    CALENDAR_EVENT_DONE_KEYS,
    CALENDAR_EVENT_FAILURE_KEYS,
} from './calendar-event-toast-keys';

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
    ...[
        'newEventOn',
        'createTitle',
        'editTitle',
        'description',
        'cancel',
        'create',
        'creating',
        'save',
        'saving',
        'delete',
        'confirmDelete',
        'deleting',
        'keep',
    ].map((key) => `drawer.${key}`),
    'form.title.label',
    'form.title.errors.required',
    'form.title.errors.tooLong',
    'form.description.label',
    'form.description.errors.tooLong',
    ...['day', 'allDay', 'startsAt', 'endsAt', 'endsOn', 'clearEndsOn'].map(
        (key) => `form.moment.${key}`,
    ),
    ...[
        'startsOnRequired',
        'dayInvalid',
        'hourInvalid',
        'endsOnNotAfterStartsOn',
        'endsAtWithoutStartsAt',
        'endsAtNotAfterStartsAt',
    ].map((key) => `form.moment.errors.${key}`),
    'form.isPrivate.label',
    'form.isPrivate.hint',
    'form.audience.errors.required',
    'form.audience.errors.privateNotForMe',
    ...[
        ...Object.values(CALENDAR_EVENT_DONE_KEYS),
        ...Object.values(CALENDAR_EVENT_FAILURE_KEYS),
    ],
    ...[...AGENDA_SCREEN_ERROR_CODES, ...Object.values(ApiErrorCodeEnum)].map(
        (code) => `apiErrors.${code}`,
    ),
];

describe('Feature: messages of the agenda screen (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the screen, of the event drawer and of the server errors in %s',
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
