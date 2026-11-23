import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import {
    PAIRING_NAMESPACE,
    PAIRING_SCREEN_ERROR_CODES,
} from './pairing-i18n-namespaces';

const REQUIRED_KEYS = [
    ...PAIRING_SCREEN_ERROR_CODES,
    ...Object.values(ApiErrorCodeEnum),
].map((code) => `apiErrors.${code}`);

describe('Feature: messages of the pairing screen (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has a message for every server error the screen can receive in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][PAIRING_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
