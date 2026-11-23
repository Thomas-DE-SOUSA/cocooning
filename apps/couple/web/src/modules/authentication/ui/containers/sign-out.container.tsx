'use client';

import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { SIGN_OUT_NAMESPACE } from '../../data/authentication-i18n-namespaces';
import { authenticationCommandGateway } from '../../gateways';
import { useSignOut } from '../../hooks/use-sign-out';
import { SignOutView } from '../views/sign-out.view';

export function SignOutContainer() {
    const { t } = useTranslation(SIGN_OUT_NAMESPACE);
    const router = useRouter();
    const { signOut, isPending } = useSignOut({
        gateway: authenticationCommandGateway,
        onSignedOut: () => router.replace(WebRouterEnum.ACCOUNT_SIGN_IN),
        onSignOutFailed: (error) =>
            toast.error(t('toast.signOutFailed'), {
                description: describeApiResultError(error, t),
            }),
    });
    return (
        <SignOutView
            isPending={isPending}
            onSignOut={signOut}
        />
    );
}
