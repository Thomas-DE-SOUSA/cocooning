import { PairingExceptionCodeEnum } from '@cocooning/couple-contract/pairing';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { PairingException } from '../../../domain/exceptions/pairing.exception';
import { Couple } from '../../../domain/models/couple.aggregate';
import type { CoupleSnapshot } from '../../../domain/models/couple.aggregate.type';
import { CoupleRepository } from '../../../domain/ports/couple.repository';

const FIRST_VERSION = 1;

const sharesAPartner = (left: CoupleSnapshot, right: CoupleSnapshot): boolean =>
    left.partners.some(({ userId }) =>
        right.partners.some((partner) => partner.userId === userId),
    );

const sharesTheCode = (left: CoupleSnapshot, right: CoupleSnapshot): boolean =>
    left.invitationCode !== null &&
    left.invitationCode.value === right.invitationCode?.value;

const fail = (code: keyof typeof PairingExceptionCodeEnum): never => {
    throw new PairingException({ code, message: `In-memory ${code}` });
};

// Mimics the adapter: optimistic version, unique partner, unique code, outbox.
export class CoupleInMemoryRepository extends CoupleRepository {
    private snapshots: ReadonlyMap<string, CoupleSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: Couple | null = null;

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<CoupleSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(couple: Couple): void {
        this.store(couple.toSnapshot());
    }

    simulateConcurrentSave(couple: Couple): void {
        this.concurrentSave = couple;
    }

    override save(couple: Couple): Promise<void> {
        return Promise.resolve().then(() => this.write(couple));
    }

    override findByPartner(userId: string): Promise<Couple | null> {
        return this.findWhere((snapshot) =>
            snapshot.partners.some((partner) => partner.userId === userId),
        );
    }

    override findByInvitationCode(code: string): Promise<Couple | null> {
        return this.findWhere(
            (snapshot) => snapshot.invitationCode?.value === code,
        );
    }

    private write(couple: Couple): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(couple.toSnapshot());
        this.outbox = [...this.outbox, ...couple.getDomainEvents()];
    }

    private findWhere(
        predicate: (snapshot: CoupleSnapshot) => boolean,
    ): Promise<Couple | null> {
        const found = this.storedSnapshots.find(predicate);
        return Promise.resolve(
            found === undefined
                ? null
                : Couple.fromSnapshot(structuredClone(found)),
        );
    }

    private store(snapshot: CoupleSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            fail(PairingExceptionCodeEnum.PAIRING_COUPLE_VERSION_CONFLICT);
        }
        const others = this.storedSnapshots.filter(
            ({ id }) => id !== snapshot.id,
        );
        if (others.some((other) => sharesAPartner(other, snapshot))) {
            fail(PairingExceptionCodeEnum.PAIRING_PARTNER_ALREADY_IN_COUPLE);
        }
        if (others.some((other) => sharesTheCode(other, snapshot))) {
            fail(PairingExceptionCodeEnum.PAIRING_INVITATION_CODE_CONFLICT);
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
