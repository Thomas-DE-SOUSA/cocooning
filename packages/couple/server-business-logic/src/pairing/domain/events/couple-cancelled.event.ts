import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type PairingEventParams,
    toDomainEventParams,
} from './pairing-event-params';

export class CoupleCancelledEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'pairing.couple.cancelled' as const;

    constructor(params: PairingEventParams<null>) {
        super(toDomainEventParams(CoupleCancelledEvent.EVENT_NAME, params));
    }
}
