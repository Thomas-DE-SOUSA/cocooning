import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import { useCallback, useTransition } from 'react';
import type { AuthenticationCommandGateway } from '../gateways/ports/authentication-command.gateway';

type Options = {
    readonly gateway: AuthenticationCommandGateway;
    readonly onSignedOut: () => void;
    readonly onSignOutFailed: (error: ApiError) => void;
};

export function useSignOut({ gateway, onSignedOut, onSignOutFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const signOut = useCallback(
        () =>
            startTransition(async () => {
                const result = await gateway.signOut();
                if (result.success) {
                    onSignedOut();
                    return;
                }
                onSignOutFailed(result.error);
            }),
        [gateway, onSignedOut, onSignOutFailed],
    );
    return { signOut, isPending };
}
