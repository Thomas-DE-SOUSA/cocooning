import type { CouplePairingStatus } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type PairingEventParams,
    toDomainEventParams,
} from './pairing-event-params';

export type CoupleCreatedData = {
    readonly creatorUserId: string;
    readonly pairingStatus: CouplePairingStatus;
};

export class CoupleCreatedEvent extends DomainEventBase<CoupleCreatedData> {
    static readonly EVENT_NAME = 'pairing.couple.created' as const;

    constructor(params: PairingEventParams<CoupleCreatedData>) {
        super(toDomainEventParams(CoupleCreatedEvent.EVENT_NAME, params));
    }
}
