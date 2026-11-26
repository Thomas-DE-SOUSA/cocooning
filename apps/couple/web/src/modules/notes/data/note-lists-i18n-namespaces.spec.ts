import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    NOTE_LISTS_NAMESPACE,
    NOTE_LISTS_SCREEN_ERROR_CODES,
} from './note-lists-i18n-namespaces';

// The messages of createNoteListFormSchema(t) (decision 0031).
const FORM_KEYS = [
    'form.listTitle.errors.required',
    'form.listTitle.errors.tooLong',
    'form.listEmoji.errors.tooLong',
    'form.listKind.errors.required',
    'form.listSpace.errors.required',
];

const REQUIRED_KEYS = [
    ...FORM_KEYS,
    ...[
        ...NOTE_LISTS_SCREEN_ERROR_CODES,
        ...Object.values(ApiErrorCodeEnum),
    ].map((code) => `apiErrors.${code}`),
];

describe('Feature: messages of the Lists tab (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the server errors and of the list form in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][NOTE_LISTS_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
