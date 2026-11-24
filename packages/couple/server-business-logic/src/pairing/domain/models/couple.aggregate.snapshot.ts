import { EntityMetadata } from '@cocooning/shared-kernel/domain';
import { CoupleId } from '../value-objects/couple-id.vo';
import { InvitationCode } from '../value-objects/invitation-code.vo';
import { TogetherPeriods } from '../value-objects/together-periods.vo';
import { CouplePartner } from './couple-partner.entity';
import type { CoupleProps, CoupleSnapshot } from './couple.aggregate.type';

// Rebuilds the props without validating: stored data keeps loading if a rule tightens (domain.md rule 5).
export const couplePropsFromSnapshot = (
    snapshot: CoupleSnapshot,
): CoupleProps => ({
    id: CoupleId.from(snapshot.id),
    pairingStatus: snapshot.pairingStatus,
    partners: snapshot.partners.map((partner) =>
        CouplePartner.fromSnapshot(partner),
    ),
    invitationCode:
        snapshot.invitationCode === null
            ? null
            : InvitationCode.from(snapshot.invitationCode),
    togetherPeriods: TogetherPeriods.from(snapshot.togetherPeriods),
    version: snapshot.version,
    metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
});

export const coupleSnapshotFromProps = (
    props: CoupleProps,
): CoupleSnapshot => ({
    id: props.id.getValue(),
    pairingStatus: props.pairingStatus,
    partners: props.partners.map((partner) => partner.toSnapshot()),
    invitationCode: props.invitationCode?.toSnapshot() ?? null,
    togetherPeriods: props.togetherPeriods.toSnapshot(),
    version: props.version,
    metadata: props.metadata.toSnapshot(),
});
