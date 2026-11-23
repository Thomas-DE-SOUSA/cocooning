'use client';

import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { PAIRING_NAMESPACE } from '../../data/pairing-i18n-namespaces';
import { pairingCommandGateway } from '../../gateways';
import { usePairingCommands } from '../../hooks/use-pairing-commands';
import { useRefreshOnReturn } from '../../hooks/use-refresh-on-return';
import { useShareInvitationCode } from '../../hooks/use-share-invitation-code';
import {
    type PairingScreenViewModel,
    PairingStepEnum,
} from '../../view-models/pairing-screen.view-model';
import { InvitationCodeView } from '../views/invitation-code.view';
import { NoCoupleView } from '../views/no-couple.view';
import { PairingUnavailableView } from '../views/pairing-unavailable.view';

export function PairingContainer({
    viewModel,
}: {
    readonly viewModel: PairingScreenViewModel;
}) {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    const { createCouple, renewInvitationCode, isPending } = usePairingCommands(
        {
            gateway: pairingCommandGateway,
            onDone: refresh,
            onCreateFailed: (error) =>
                toast.error(t('toast.createFailed'), {
                    description: describeApiResultError(error, t),
                }),
            onRenewFailed: (error) =>
                toast.error(t('toast.renewFailed'), {
                    description: describeApiResultError(error, t),
                }),
        },
    );
    const share = useShareInvitationCode({
        onCopied: () => toast.success(t('toast.copied')),
        onShareFailed: () => toast.error(t('toast.shareFailed')),
    });

    if (viewModel.step === PairingStepEnum.NO_COUPLE) {
        return (
            <NoCoupleView
                isPending={isPending}
                onCreateCouple={createCouple}
            />
        );
    }
    if (viewModel.step === PairingStepEnum.UNAVAILABLE) {
        return (
            <PairingUnavailableView
                description={describeApiResultError(viewModel.error, t)}
                onRefresh={refresh}
            />
        );
    }
    const { invitationCode } = viewModel;
    return (
        <InvitationCodeView
            invitationCode={invitationCode}
            expiresAt={viewModel.expiresAt}
            isPending={isPending}
            onShare={() =>
                void share(t('waiting.shareText', { invitationCode }))
            }
            onRenew={renewInvitationCode}
            onRefresh={refresh}
        />
    );
}
