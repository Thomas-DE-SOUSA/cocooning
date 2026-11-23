'use client';

import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { toast } from '@cocooning/design-system';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { describeApiResultError } from '@/shared/application/api-result/describe-api-result-error';
import { SIGN_IN_NAMESPACE } from '../../data/authentication-i18n-namespaces';
import { authenticationCommandGateway } from '../../gateways';
import { useSignIn } from '../../hooks/use-sign-in';
import { useSignInForm } from '../../hooks/use-sign-in-form';
import { SignInFormView } from '../views/sign-in-form.view';

export function SignInContainer() {
    const { t } = useTranslation(SIGN_IN_NAMESPACE);
    const router = useRouter();
    const form = useSignInForm();
    const { signIn, isPending } = useSignIn({
        gateway: authenticationCommandGateway,
        onSignedIn: () => router.replace(WebRouterEnum.HOME),
        onSignInFailed: (error) =>
            toast.error(t('toast.signInFailed'), {
                description: describeApiResultError(error, t),
            }),
    });
    return (
        <SignInFormView
            form={form}
            viewModel={{ isPending, onSubmit: signIn }}
        />
    );
}
