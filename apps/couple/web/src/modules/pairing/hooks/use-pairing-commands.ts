import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useTransition } from 'react';
import type { PairingCommandGateway } from '../gateways/ports/pairing-command.gateway';

type Options = {
    readonly gateway: PairingCommandGateway;
    readonly onDone: () => void;
    readonly onCreateFailed: (error: ApiError) => void;
    readonly onRenewFailed: (error: ApiError) => void;
};

// onDone runs inside the transition: the button spins until the refreshed page shows (decision 0036).
export function usePairingCommands({
    gateway,
    onDone,
    onCreateFailed,
    onRenewFailed,
}: Options) {
    const [isPending, startTransition] = useTransition();
    const run = useCallback(
        (
            command: () => Promise<Result<null, ApiError>>,
            onFailed: (error: ApiError) => void,
        ) =>
            startTransition(async () => {
                const result = await command();
                if (result.success) {
                    onDone();
                    return;
                }
                onFailed(result.error);
            }),
        [onDone],
    );
    const createCouple = useCallback(
        () => run(() => gateway.createCouple(), onCreateFailed),
        [run, gateway, onCreateFailed],
    );
    const renewInvitationCode = useCallback(
        () => run(() => gateway.renewInvitationCode(), onRenewFailed),
        [run, gateway, onRenewFailed],
    );
    return { createCouple, renewInvitationCode, isPending };
}
