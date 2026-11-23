import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { AuthenticationExceptionCodeEnum } from '@cocooning/couple-contract/authentication';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { SIGN_IN_NAMESPACE } from './authentication-i18n-namespaces';

const REQUIRED_KEYS = [
    'form.emailAddress.errors.required',
    'form.emailAddress.errors.tooLong',
    'form.password.errors.required',
    'form.password.errors.tooLong',
    `apiErrors.${AuthenticationExceptionCodeEnum.AUTHENTICATION_CREDENTIALS_INVALID}`,
    ...Object.values(ApiErrorCodeEnum).map((code) => `apiErrors.${code}`),
];

describe('Feature: messages of the sign-in screen', () => {
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
