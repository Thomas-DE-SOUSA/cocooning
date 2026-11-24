import {
    type CouplePairingStatus,
    CouplePairingStatusEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    AggregateRoot,
    type DomainEvent,
    EntityMetadata,
} from '@cocooning/shared-kernel/domain';
import { CoupleCancelledEvent } from '../events/couple-cancelled.event';
import { CoupleCreatedEvent } from '../events/couple-created.event';
import { CouplePairedEvent } from '../events/couple-paired.event';
import type { PairingEventParams } from '../events/pairing-event-params';
import { InvitationCodeRenewedEvent } from '../events/invitation-code-renewed.event';
import { TogetherPeriodsRecordedEvent } from '../events/together-periods-recorded.event';
import { CouplePairingValidator } from '../services/couple-pairing.validator';
import { CoupleId } from '../value-objects/couple-id.vo';
import type { InvitationCode } from '../value-objects/invitation-code.vo';
import { TogetherPeriods } from '../value-objects/together-periods.vo';
import { CouplePartner } from './couple-partner.entity';
import {
    couplePropsFromSnapshot,
    coupleSnapshotFromProps,
} from './couple.aggregate.snapshot';
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
            togetherPeriods: TogetherPeriods.empty(),
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        couple.recordEvent(CoupleCreatedEvent, input.creatorUserId, now, {
            creatorUserId: input.creatorUserId,
            pairingStatus: CouplePairingStatusEnum.PENDING,
        });
        return couple;
    }

    static fromSnapshot(snapshot: CoupleSnapshot): Couple {
        return new Couple(couplePropsFromSnapshot(snapshot));
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
        this.recordEvent(CouplePairedEvent, partnerUserId, now, {
            partnerUserIds: this.partners.map(({ userId }) => userId),
            pairingStatus: CouplePairingStatusEnum.PAIRED,
        });
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
        this.recordEvent(InvitationCodeRenewedEvent, partnerUserId, now, null);
    }

    // R8: only the single partner of a pending couple cancels it; the adapter releases the partner.
    cancel(partnerUserId: string, now: Date): void {
        CouplePairingValidator.ensureMember(this.partners, partnerUserId);
        CouplePairingValidator.ensurePending(this.pairingStatus);
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.recordEvent(CoupleCancelledEvent, partnerUserId, now, null);
    }

    // R9: the new list replaces the previous one; the event carries no day (core.md rule 33).
    recordTogetherPeriods(
        partnerUserId: string,
        togetherPeriods: TogetherPeriods,
        now: Date,
    ): void {
        CouplePairingValidator.ensureMember(this.partners, partnerUserId);
        CouplePairingValidator.ensurePaired(this.pairingStatus);
        this.props.togetherPeriods = togetherPeriods;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.recordEvent(TogetherPeriodsRecordedEvent, partnerUserId, now, {
            periodCount: togetherPeriods.count,
        });
    }

    private recordEvent<TData>(
        Event: new (params: PairingEventParams<TData>) => DomainEvent<TData>,
        userId: string,
        now: Date,
        data: TData,
    ): void {
        this.addDomainEvent(
            new Event({
                coupleId: this.id.getValue(),
                userId,
                occurredAt: now,
                data,
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

    get togetherPeriods(): TogetherPeriods {
        return this.props.togetherPeriods;
    }

    get version(): number {
        return this.props.version;
    }

    toSnapshot(): CoupleSnapshot {
        return coupleSnapshotFromProps(this.props);
    }
}
