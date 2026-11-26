import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { CalendarLabelColorEnum } from '@cocooning/couple-shared-kernel/enums';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    CALENDAR_LABEL_DONE_KEYS,
    CALENDAR_LABEL_FAILURE_KEYS,
} from './calendar-label-toast-keys';
import {
    CALENDAR_LABELS_NAMESPACE,
    CALENDAR_LABELS_SCREEN_ERROR_CODES,
} from './calendar-labels-i18n-namespace';

const REQUIRED_KEYS = [
    ...[
        'createTitle',
        'editTitle',
        'description',
        'cancel',
        'create',
        'creating',
        'save',
        'saving',
        'sharedHint',
    ].map((key) => `sheet.${key}`),
    'form.labelName.label',
    'form.labelName.errors.required',
    'form.labelName.errors.tooLong',
    'form.labelColor.label',
    'form.labelColor.errors.required',
    ...Object.values(CalendarLabelColorEnum).map((color) => `colors.${color}`),
    ...['ask', 'description', 'confirm', 'deleting', 'keep'].map(
        (key) => `deletion.${key}`,
    ),
    ...['title', 'hint', 'empty', 'edit'].map((key) => `card.${key}`),
    'unavailable.title',
    'unavailable.refresh',
    ...Object.values(CALENDAR_LABEL_DONE_KEYS),
    ...Object.values(CALENDAR_LABEL_FAILURE_KEYS),
    ...[
        ...CALENDAR_LABELS_SCREEN_ERROR_CODES,
        ...Object.values(ApiErrorCodeEnum),
    ].map((code) => `apiErrors.${code}`),
];

describe('Feature: messages of the label sheet (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the sheet, of its form and of the server errors in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][CALENDAR_LABELS_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
