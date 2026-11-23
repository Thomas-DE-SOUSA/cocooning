import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    NOTES_NAMESPACE,
    NOTES_SCREEN_ERROR_CODES,
} from './notes-i18n-namespaces';

const REQUIRED_KEYS = [
    'form.title.errors.required',
    'form.title.errors.tooLong',
    ...[...NOTES_SCREEN_ERROR_CODES, ...Object.values(ApiErrorCodeEnum)].map(
        (code) => `apiErrors.${code}`,
    ),
];

describe('Feature: messages of the notes screen (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the title form and of the server errors in %s',
        (locale) => {
            const keys = flattenLocale(RESOURCES[locale][NOTES_NAMESPACE]).map(
                ({ key }) => key,
            );

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
