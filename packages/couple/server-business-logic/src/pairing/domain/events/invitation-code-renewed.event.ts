import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type PairingEventParams,
    toDomainEventParams,
} from './pairing-event-params';

// The code itself is a secret: no event carries it (core.md rule 30).
export class InvitationCodeRenewedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'pairing.invitation-code.renewed' as const;

    constructor(params: PairingEventParams<null>) {
        super(
            toDomainEventParams(InvitationCodeRenewedEvent.EVENT_NAME, params),
        );
    }
}
