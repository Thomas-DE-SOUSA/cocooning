import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { PushNotificationKindEnum } from '@cocooning/couple-shared-kernel/enums';
import { flattenLocale } from '@/i18n/__tests__/flatten-locale';
import { I18N_CONFIG } from '@/i18n/config';
import { RESOURCES } from '@/i18n/resources';
import { PushNotificationsStatusEnum } from '../view-models/push-notifications.view-model';
import {
    PUSH_NOTIFICATIONS_ERROR_CODES,
    PUSH_NOTIFICATIONS_NAMESPACE,
} from './push-notifications-i18n-namespace';

const REQUIRED_KEYS = [
    ...Object.values(PushNotificationKindEnum).map(
        (kind) => `notification.${kind}`,
    ),
    'notification.generic',
    ...Object.values(PushNotificationsStatusEnum)
        .filter((status) => status !== PushNotificationsStatusEnum.CHECKING)
        .map((status) => `card.${status}`),
    ...[
        'title',
        'checking',
        'turnOn',
        'turningOn',
        'turnOff',
        'turningOff',
    ].map((key) => `card.${key}`),
    'toast.failed',
    'toast.phoneRefused',
    ...[
        ...PUSH_NOTIFICATIONS_ERROR_CODES,
        ...Object.values(ApiErrorCodeEnum),
    ].map((code) => `apiErrors.${code}`),
];

describe('Feature: messages of the notifications (decision 0037)', () => {
    it.each(I18N_CONFIG.supportedLocales)(
        'has every sentence of the service worker, the card and the server errors in %s',
        (locale) => {
            const keys = flattenLocale(
                RESOURCES[locale][PUSH_NOTIFICATIONS_NAMESPACE],
            ).map(({ key }) => key);

            expect(REQUIRED_KEYS.filter((key) => !keys.includes(key))).toEqual(
                [],
            );
        },
    );
});
