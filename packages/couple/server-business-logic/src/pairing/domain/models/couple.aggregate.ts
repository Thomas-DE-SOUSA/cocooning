import {
    type CouplePairingStatus,
    CouplePairingStatusEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { CoupleCreatedEvent } from '../events/couple-created.event';
import { CouplePairedEvent } from '../events/couple-paired.event';
import { InvitationCodeRenewedEvent } from '../events/invitation-code-renewed.event';
import { CouplePairingValidator } from '../services/couple-pairing.validator';
import { CoupleId } from '../value-objects/couple-id.vo';
import { InvitationCode } from '../value-objects/invitation-code.vo';
import { CouplePartner } from './couple-partner.entity';
import type {
    CoupleProps,
    CoupleSnapshot,
    CreateCoupleInput,
} from './couple.aggregate.type';

const INITIAL_VERSION = 1;

export class Couple extends AggregateRoot {
    private constructor(private readonly props: CoupleProps) {
        super();
    }

    // R2: the creator is the first partner and holds the invitation code.
    static create(input: CreateCoupleInput, now: Date): Couple {
        const couple = new Couple({
            id: CoupleId.generate(),
            pairingStatus: CouplePairingStatusEnum.PENDING,
            partners: [CouplePartner.join(input.creatorUserId, now)],
            invitationCode: input.invitationCode,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        couple.addDomainEvent(
            new CoupleCreatedEvent({
                coupleId: couple.id.getValue(),
                userId: input.creatorUserId,
                occurredAt: now,
                data: {
                    creatorUserId: input.creatorUserId,
                    pairingStatus: CouplePairingStatusEnum.PENDING,
                },
            }),
        );
        return couple;
    }

    static fromSnapshot(snapshot: CoupleSnapshot): Couple {
        return new Couple({
            id: CoupleId.from(snapshot.id),
            pairingStatus: snapshot.pairingStatus,
            partners: snapshot.partners.map((partner) =>
                CouplePartner.fromSnapshot(partner),
            ),
            invitationCode:
                snapshot.invitationCode === null
                    ? null
                    : InvitationCode.from(snapshot.invitationCode),
            version: snapshot.version,
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R5, R6: a valid code lets the second partner in once, then disappears.
    join(partnerUserId: string, enteredCode: string, now: Date): void {
        CouplePairingValidator.ensureNotMember(this.partners, partnerUserId);
        CouplePairingValidator.ensureJoinableWith(this.props, enteredCode, now);
        this.props.partners = [
            ...this.props.partners,
            CouplePartner.join(partnerUserId, now),
        ];
        this.props.pairingStatus = CouplePairingStatusEnum.PAIRED;
        this.props.invitationCode = null;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new CouplePairedEvent({
                coupleId: this.id.getValue(),
                userId: partnerUserId,
                occurredAt: now,
                data: {
                    partnerUserIds: this.partners.map(({ userId }) => userId),
                    pairingStatus: CouplePairingStatusEnum.PAIRED,
                },
            }),
        );
    }

    // R7: a new code and a new deadline; the previous code is worth nothing.
    renewInvitationCode(
        partnerUserId: string,
        invitationCode: InvitationCode,
        now: Date,
    ): void {
        CouplePairingValidator.ensureMember(this.partners, partnerUserId);
        CouplePairingValidator.ensurePending(this.pairingStatus);
        this.props.invitationCode = invitationCode;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new InvitationCodeRenewedEvent({
                coupleId: this.id.getValue(),
                userId: partnerUserId,
                occurredAt: now,
                data: null,
            }),
        );
    }

    get id(): CoupleId {
        return this.props.id;
    }

    get pairingStatus(): CouplePairingStatus {
        return this.props.pairingStatus;
    }

    get partners(): ReadonlyArray<CouplePartner> {
        return this.props.partners;
    }

    get invitationCode(): InvitationCode | null {
        return this.props.invitationCode;
    }

    get version(): number {
        return this.props.version;
    }

    toSnapshot(): CoupleSnapshot {
        return {
            id: this.props.id.getValue(),
            pairingStatus: this.props.pairingStatus,
            partners: this.props.partners.map((partner) =>
                partner.toSnapshot(),
            ),
            invitationCode: this.props.invitationCode?.toSnapshot() ?? null,
            version: this.props.version,
            metadata: this.props.metadata.toSnapshot(),
        };
    }
}
