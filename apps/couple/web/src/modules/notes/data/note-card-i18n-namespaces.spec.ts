import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    NOTE_CARD_NAMESPACE,
    NOTE_CARD_SCREEN_ERROR_CODES,
} from './note-card-i18n-namespaces';

const REQUIRED_KEYS = [
    'form.name.errors.required',
    'form.name.errors.tooLong',
    'form.query.errors.required',
    'form.query.errors.tooLong',
    'form.value.errors.required',
    'form.value.errors.tooLong',
    ...[
        ...NOTE_CARD_SCREEN_ERROR_CODES,
        ...Object.values(ApiErrorCodeEnum),
    ].map((code) => `apiErrors.${code}`),
];

describe('Feature: messages of the cards of the notes (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the forms and of the server errors in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][NOTE_CARD_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
