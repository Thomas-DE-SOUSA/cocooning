'use client';

import { toast } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { PUSH_NOTIFICATIONS_NAMESPACE } from '../../data/push-notifications-i18n-namespace';
import {
    phonePushGateway,
    pushSubscriptionCommandGateway,
} from '../../gateways';
import { usePushNotifications } from '../../hooks/use-push-notifications';
import { PushNotificationsView } from '../views/push-notifications.view';

// R11: the notifications of this phone, in the "Nous" tab.
export function PushNotificationsContainer() {
    const { t } = useTranslation(PUSH_NOTIFICATIONS_NAMESPACE);
    const { status, isPending, turnOn, turnOff } = usePushNotifications({
        phone: phonePushGateway,
        server: pushSubscriptionCommandGateway,
        onApiFailed: (error) =>
            toast.error(t('toast.failed'), {
                description: describeApiResultError(error, t),
            }),
        onPhoneRefused: () =>
            toast.error(t('toast.failed'), {
                description: t('toast.phoneRefused'),
            }),
    });
    return (
        <PushNotificationsView
            status={status}
            isPending={isPending}
            onTurnOn={() => void turnOn()}
            onTurnOff={() => void turnOff()}
        />
    );
}
