'use client';

import { Button } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { PAIRING_NAMESPACE } from '../../data/pairing-i18n-namespaces';
import { CommandButton } from '../components/command-button';

type Props = {
    readonly invitationCode: string;
    readonly expiresAt: string;
    readonly isExpired: boolean;
    readonly isRenewing: boolean;
    readonly isCancelling: boolean;
    readonly isBusy: boolean;
    readonly onShare: () => void;
    readonly onRenew: () => void;
    readonly onCancel: () => void;
    readonly onRefresh: () => void;
};

// R4: an expired code is no longer offered for sharing, a new one comes first (R7); R8: the couple can be cancelled.
export function InvitationCodeView({
    invitationCode,
    expiresAt,
    isExpired,
    isRenewing,
    isCancelling,
    isBusy,
    onShare,
    onRenew,
    onCancel,
    onRefresh,
}: Props) {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    return (
        <section className="flex w-full max-w-sm flex-col gap-4 text-center">
            <p className="text-sm text-muted-foreground">
                {t('waiting.intro')}
            </p>
            <p
                className="font-mono text-3xl font-semibold tracking-[0.3em]"
                aria-live="polite"
            >
                {invitationCode}
            </p>
            <p className="text-sm text-muted-foreground">
                {isExpired
                    ? t('waiting.expired', { expiresAt })
                    : t('waiting.expiresAt', { expiresAt })}
            </p>
            {isExpired ? null : (
                <Button onClick={onShare}>{t('waiting.share')}</Button>
            )}
            <CommandButton
                variant={isExpired ? 'primary' : 'secondary'}
                label={t('waiting.renew')}
                pendingLabel={t('waiting.renewing')}
                isPending={isRenewing}
                isBusy={isBusy}
                onClick={onRenew}
            />
            <Button
                variant="ghost"
                onClick={onRefresh}
            >
                {t('waiting.refresh')}
            </Button>
            <CommandButton
                variant="ghost"
                label={t('waiting.cancel')}
                pendingLabel={t('waiting.cancelling')}
                isPending={isCancelling}
                isBusy={isBusy}
                onClick={onCancel}
            />
        </section>
    );
}
