'use client';

import { pairingCommandGateway } from '../../gateways';
import { usePairingScreen } from '../../hooks/use-pairing-screen';
import {
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
    if (viewModel.step === PairingStepEnum.NO_COUPLE) {
        return (
            <>
                <NoCoupleView
                    isPending={
                        screen.pendingCommand ===
                        PairingCommandEnum.CREATE_COUPLE
                    }
                    onCreateCouple={screen.createCouple}
                />
                <JoinCoupleFormView
                    form={screen.joinForm}
                    isPending={
                        screen.pendingCommand === PairingCommandEnum.JOIN_COUPLE
                    }
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
            isPending={
                screen.pendingCommand ===
                PairingCommandEnum.RENEW_INVITATION_CODE
            }
            onShare={() => screen.shareInvitationCode(viewModel.invitationCode)}
            onRenew={screen.renewInvitationCode}
            onRefresh={screen.refresh}
        />
    );
}
