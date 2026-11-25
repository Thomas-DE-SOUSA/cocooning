'use client';

import { Skeleton } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { CommandButton } from '@/shared/ui/command-button';
import { PUSH_NOTIFICATIONS_NAMESPACE } from '../../data/push-notifications-i18n-namespace';
import {
    type PushNotificationsStatus,
    PushNotificationsStatusEnum,
} from '../../view-models/push-notifications.view-model';

type Props = {
    readonly status: PushNotificationsStatus;
    readonly isPending: boolean;
    readonly onTurnOn: () => void;
    readonly onTurnOff: () => void;
};

// R11: what this phone allows, and the one action that changes it.
export function PushNotificationsView({
    status,
    isPending,
    onTurnOn,
    onTurnOff,
}: Props) {
    const { t } = useTranslation(PUSH_NOTIFICATIONS_NAMESPACE);
    if (status === PushNotificationsStatusEnum.CHECKING) {
        return (
            <div
                role="status"
                aria-label={t('card.checking')}
                className="flex flex-col gap-3"
            >
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-11 w-52" />
            </div>
        );
    }
    return (
        <>
            <p className="text-sm text-muted-foreground">
                {t(`card.${status}`)}
            </p>
            {status === PushNotificationsStatusEnum.OFF && (
                <CommandButton
                    variant="primary"
                    label={t('card.turnOn')}
                    pendingLabel={t('card.turningOn')}
                    isPending={isPending}
                    isBusy={isPending}
                    onClick={onTurnOn}
                />
            )}
            {status === PushNotificationsStatusEnum.ON && (
                <CommandButton
                    variant="ghost"
                    label={t('card.turnOff')}
                    pendingLabel={t('card.turningOff')}
                    isPending={isPending}
                    isBusy={isPending}
                    onClick={onTurnOff}
                />
            )}
        </>
    );
}
