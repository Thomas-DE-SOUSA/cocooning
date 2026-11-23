import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    SIGN_IN_NAMESPACE,
    SIGN_IN_SCREEN_ERROR_CODES,
    SIGN_OUT_NAMESPACE,
    SIGN_OUT_SCREEN_ERROR_CODES,
} from './authentication-i18n-namespaces';

const REQUIRED_KEYS = [
    'form.emailAddress.errors.required',
    'form.emailAddress.errors.tooLong',
    'form.password.errors.required',
    'form.password.errors.tooLong',
    ...[...SIGN_IN_SCREEN_ERROR_CODES, ...Object.values(ApiErrorCodeEnum)].map(
        (code) => `apiErrors.${code}`,
    ),
];

describe('Feature: messages of the sign-in screen (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the form schema and of the server errors in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][SIGN_IN_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});

describe('Feature: messages of the sign-out button (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every key of the server errors in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][SIGN_OUT_NAMESPACE],
            ).map(({ key }) => key);
            const required = [
                ...SIGN_OUT_SCREEN_ERROR_CODES,
                ...Object.values(ApiErrorCodeEnum),
            ].map((code) => `apiErrors.${code}`);

            expect(required.filter((key) => !keys.includes(key))).toEqual([]);
        },
    );
});
