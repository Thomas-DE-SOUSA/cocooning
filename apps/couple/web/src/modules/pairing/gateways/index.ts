import { pairingCoupleCancelAction } from '../actions/pairing-couple-cancel.action';
import { pairingCoupleCreateAction } from '../actions/pairing-couple-create.action';
import { pairingCoupleJoinAction } from '../actions/pairing-couple-join.action';
import { pairingInvitationCodeRenewAction } from '../actions/pairing-invitation-code-renew.action';
import type { PairingCommandGateway } from './ports/pairing-command.gateway';
import { ServerActionPairingCommandGateway } from './server-action/server-action-pairing-command.gateway';

export const pairingCommandGateway: PairingCommandGateway =
    new ServerActionPairingCommandGateway({
        createCouple: pairingCoupleCreateAction,
        joinCouple: pairingCoupleJoinAction,
        renewInvitationCode: pairingInvitationCodeRenewAction,
        cancelCouple: pairingCoupleCancelAction,
    });
