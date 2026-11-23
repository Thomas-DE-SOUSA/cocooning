import type { SignInForm } from '@cocooning/couple-client-business-logic/authentication';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useCallback, useTransition } from 'react';
import type { AuthenticationCommandGateway } from '../gateways/ports/authentication-command.gateway';

type Options = {
    readonly gateway: AuthenticationCommandGateway;
    readonly onSignedIn: () => void;
    readonly onSignInFailed: (error: ApiError) => void;
};

// The transition stays pending through onSignedIn, so the button spins until the next page shows.
export function useSignIn({ gateway, onSignedIn, onSignInFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const signIn = useCallback(
        (form: SignInForm) =>
            startTransition(async () => {
                const result = await gateway.signIn(form);
                if (result.success) {
                    onSignedIn();
                    return;
                }
                onSignInFailed(result.error);
            }),
        [gateway, onSignedIn, onSignInFailed],
    );
    return { signIn, isPending };
}
