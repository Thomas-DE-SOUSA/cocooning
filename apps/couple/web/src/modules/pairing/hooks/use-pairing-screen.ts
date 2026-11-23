import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { PAIRING_NAMESPACE } from '../data/pairing-i18n-namespaces';
import type { PairingCommandGateway } from '../gateways/ports/pairing-command.gateway';
import { resolveCommandFailureFollowUp } from '../presenters/command-failure.presenter';
import {
    CommandFailureFollowUpEnum,
    type PairingCommand,
} from '../view-models/pairing-screen.view-model';
import { useJoinCoupleForm } from './use-join-couple-form';
import { usePairingCommands } from './use-pairing-commands';
import { useRefreshOnReturn } from '@/shared/application/refresh/use-refresh-on-return';
import { useShareInvitationCode } from './use-share-invitation-code';

const FAILURE_TITLE_KEYS: Readonly<Record<PairingCommand, string>> = {
    CREATE_COUPLE: 'toast.createFailed',
    JOIN_COUPLE: 'toast.joinFailed',
    RENEW_INVITATION_CODE: 'toast.renewFailed',
    CANCEL_COUPLE: 'toast.cancelFailed',
};

// Composition hook of the screen: the UI side effects (router, toasts, share sheet) live here, not in the container.
export function usePairingScreen(gateway: PairingCommandGateway) {
    const { t } = useTranslation(PAIRING_NAMESPACE);
    const router = useRouter();
    const refresh = useCallback(() => router.refresh(), [router]);
    useRefreshOnReturn(refresh);
    const onFailed = useCallback(
        (command: PairingCommand, error: ApiError) => {
            toast.error(t(FAILURE_TITLE_KEYS[command]), {
                description: describeApiResultError(error, t),
            });
            const followUp = resolveCommandFailureFollowUp(error);
            if (followUp === CommandFailureFollowUpEnum.SIGN_IN) {
                router.replace(WebRouterEnum.ACCOUNT_SIGN_IN);
            }
            if (followUp === CommandFailureFollowUpEnum.REFRESH) refresh();
        },
        [t, router, refresh],
    );
    const commands = usePairingCommands({ gateway, onDone: refresh, onFailed });
    const share = useShareInvitationCode({
        onCopied: () => toast.success(t('toast.copied')),
        onShareFailed: () => toast.error(t('toast.shareFailed')),
    });
    const shareInvitationCode = useCallback(
        (invitationCode: string) =>
            void share(t('waiting.shareText', { invitationCode })),
        [share, t],
    );
    const describeError = useCallback(
        (error: ApiError) => describeApiResultError(error, t),
        [t],
    );
    return {
        ...commands,
        joinForm: useJoinCoupleForm(),
        refresh,
        shareInvitationCode,
        describeError,
    };
}
