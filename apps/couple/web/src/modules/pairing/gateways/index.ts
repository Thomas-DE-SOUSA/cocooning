import { pairingCoupleCreateAction } from '../actions/pairing-couple-create.action';
import { pairingInvitationCodeRenewAction } from '../actions/pairing-invitation-code-renew.action';
import type { PairingCommandGateway } from './ports/pairing-command.gateway';
import { ServerActionPairingCommandGateway } from './server-action/server-action-pairing-command.gateway';

export const pairingCommandGateway: PairingCommandGateway =
    new ServerActionPairingCommandGateway({
        createCouple: pairingCoupleCreateAction,
        renewInvitationCode: pairingInvitationCodeRenewAction,
    });
export { PairingCommandGateway } from './ports/pairing-command.gateway';
