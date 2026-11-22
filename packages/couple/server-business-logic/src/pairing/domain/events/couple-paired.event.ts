import type { CouplePairingStatus } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type PairingEventParams,
    toDomainEventParams,
} from './pairing-event-params';

export type CouplePairedData = {
    readonly partnerUserIds: ReadonlyArray<string>;
    readonly pairingStatus: CouplePairingStatus;
};

export class CouplePairedEvent extends DomainEventBase<CouplePairedData> {
    static readonly EVENT_NAME = 'pairing.couple.paired' as const;

    constructor(params: PairingEventParams<CouplePairedData>) {
        super(toDomainEventParams(CouplePairedEvent.EVENT_NAME, params));
    }
}
