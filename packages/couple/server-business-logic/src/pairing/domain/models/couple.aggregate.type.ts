import type { CouplePairingStatus } from '@cocooning/couple-shared-kernel/enums';
import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { CoupleId } from '../value-objects/couple-id.vo';
import type {
    InvitationCode,
    InvitationCodeSnapshot,
} from '../value-objects/invitation-code.vo';
import type {
    CouplePartner,
    CouplePartnerSnapshot,
} from './couple-partner.entity';

export type CoupleProps = {
    readonly id: CoupleId;
    pairingStatus: CouplePairingStatus;
    partners: ReadonlyArray<CouplePartner>;
    invitationCode: InvitationCode | null;
    readonly version: number;
    metadata: EntityMetadata;
};

export type CreateCoupleInput = {
    readonly creatorUserId: string;
    readonly invitationCode: InvitationCode;
};

export type CoupleSnapshot = {
    readonly id: string;
    readonly pairingStatus: CouplePairingStatus;
    readonly partners: ReadonlyArray<CouplePartnerSnapshot>;
    readonly invitationCode: InvitationCodeSnapshot | null;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
