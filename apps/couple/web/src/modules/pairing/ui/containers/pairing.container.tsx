'use client';

import { pairingCommandGateway } from '../../gateways';
import { usePairingScreen } from '../../hooks/use-pairing-screen';
import {
    type PairingCommand,
    PairingCommandEnum,
    type PairingScreenViewModel,
    PairingStepEnum,
} from '../../view-models/pairing-screen.view-model';
import { InvitationCodeView } from '../views/invitation-code.view';
import { JoinCoupleFormView } from '../views/join-couple-form.view';
import { NoCoupleView } from '../views/no-couple.view';
import { PairingUnavailableView } from '../views/pairing-unavailable.view';

export function PairingContainer({
    viewModel,
}: {
    readonly viewModel: PairingScreenViewModel;
}) {
    const screen = usePairingScreen(pairingCommandGateway);
    const isRunning = (command: PairingCommand) =>
        screen.pendingCommand === command;
    if (viewModel.step === PairingStepEnum.NO_COUPLE) {
        return (
            <>
                <NoCoupleView
                    isPending={isRunning(PairingCommandEnum.CREATE_COUPLE)}
                    isBusy={screen.isBusy}
                    onCreateCouple={screen.createCouple}
                />
                <JoinCoupleFormView
                    form={screen.joinForm}
                    isPending={isRunning(PairingCommandEnum.JOIN_COUPLE)}
                    isBusy={screen.isBusy}
                    onJoin={screen.joinCouple}
                />
            </>
        );
    }
    if (viewModel.step === PairingStepEnum.UNAVAILABLE) {
        return (
            <PairingUnavailableView
                description={screen.describeError(viewModel.error)}
                onRefresh={screen.refresh}
            />
        );
    }
    return (
        <InvitationCodeView
            invitationCode={viewModel.invitationCode}
            expiresAt={viewModel.expiresAt}
            isExpired={viewModel.isExpired}
            isRenewing={isRunning(PairingCommandEnum.RENEW_INVITATION_CODE)}
            isCancelling={isRunning(PairingCommandEnum.CANCEL_COUPLE)}
            isBusy={screen.isBusy}
            onShare={() => screen.shareInvitationCode(viewModel.invitationCode)}
            onRenew={screen.renewInvitationCode}
            onCancel={screen.cancelCouple}
            onRefresh={screen.refresh}
        />
    );
}
