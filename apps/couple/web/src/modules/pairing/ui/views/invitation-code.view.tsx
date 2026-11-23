'use client';

import { Button, Spinner } from '@cocooning/design-system';
import { useTranslation } from 'react-i18next';
import { PAIRING_NAMESPACE } from '../../data/pairing-i18n-namespaces';

type Props = {
    readonly invitationCode: string;
    readonly expiresAt: string;
    readonly isPending: boolean;
    readonly onShare: () => void;
    readonly onRenew: () => void;
    readonly onRefresh: () => void;
};

export function InvitationCodeView({
    invitationCode,
    expiresAt,
    isPending,
    onShare,
    onRenew,
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
                {t('waiting.expiresAt', { expiresAt })}
            </p>
            <Button onClick={onShare}>{t('waiting.share')}</Button>
            <Button
                variant="secondary"
                onClick={onRenew}
                disabled={isPending}
                aria-busy={isPending}
            >
                {isPending ? (
                    <Spinner aria-label={t('waiting.renewing')} />
                ) : (
                    t('waiting.renew')
                )}
            </Button>
            <Button
                variant="ghost"
                onClick={onRefresh}
            >
                {t('waiting.refresh')}
            </Button>
        </section>
    );
}
