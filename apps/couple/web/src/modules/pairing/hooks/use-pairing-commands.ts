import type { JoinCoupleForm } from '@cocooning/couple-client-business-logic/pairing';
import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { Result } from '@cocooning/shared-kernel/utils';
import { useCallback, useState, useTransition } from 'react';
import type { PairingCommandGateway } from '../gateways/ports/pairing-command.gateway';
import {
    type PairingCommand,
    PairingCommandEnum,
} from '../view-models/pairing-screen.view-model';

type Options = {
    readonly gateway: PairingCommandGateway;
    readonly onDone: () => void;
    readonly onFailed: (command: PairingCommand, error: ApiError) => void;
};

// onDone runs inside the transition: the button spins until the refreshed page shows (decision 0036).
export function usePairingCommands({ gateway, onDone, onFailed }: Options) {
    const [isPending, startTransition] = useTransition();
    const [lastCommand, setLastCommand] = useState<PairingCommand | null>(null);
    const run = useCallback(
        (
            command: PairingCommand,
            send: () => Promise<Result<null, ApiError>>,
        ) => {
            setLastCommand(command);
            startTransition(async () => {
                const result = await send();
                if (result.success) {
                    onDone();
                    return;
                }
                onFailed(command, result.error);
            });
        },
        [onDone, onFailed],
    );
    const createCouple = useCallback(
        () =>
            run(PairingCommandEnum.CREATE_COUPLE, () => gateway.createCouple()),
        [run, gateway],
    );
    const joinCouple = useCallback(
        (form: JoinCoupleForm) =>
            run(PairingCommandEnum.JOIN_COUPLE, () => gateway.joinCouple(form)),
        [run, gateway],
    );
    const renewInvitationCode = useCallback(
        () =>
            run(PairingCommandEnum.RENEW_INVITATION_CODE, () =>
                gateway.renewInvitationCode(),
            ),
        [run, gateway],
    );
    const pendingCommand = isPending ? lastCommand : null;
    return { createCouple, joinCouple, renewInvitationCode, pendingCommand };
}
