import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingException } from '../../../domain/exceptions/messaging.exception';
import { PushSubscription } from '../../../domain/models/push-subscription.aggregate';
import type { PushSubscriptionSnapshot } from '../../../domain/models/push-subscription.aggregate.type';
import { PushSubscriptionRepository } from '../../../domain/ports/push-subscription.repository';

const FIRST_VERSION = 1;

const versionConflict = (): MessagingException =>
    new MessagingException({
        code: MessagingExceptionCodeEnum.PUSH_SUBSCRIPTION_VERSION_CONFLICT,
        message: 'In-memory PUSH_SUBSCRIPTION_VERSION_CONFLICT',
    });

// Mimics push_subscription: optimistic version, unique (couple_id, endpoint) answered as a version conflict, hard delete.
export class PushSubscriptionInMemoryRepository extends PushSubscriptionRepository {
    private snapshots: ReadonlyMap<string, PushSubscriptionSnapshot> =
        new Map();
    private concurrentSave: PushSubscriptionSnapshot | null = null;

    get storedSnapshots(): ReadonlyArray<PushSubscriptionSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(pushSubscription: PushSubscription): void {
        this.store(pushSubscription.toSnapshot());
    }

    simulateConcurrentSave(pushSubscription: PushSubscription): void {
        this.concurrentSave = pushSubscription.toSnapshot();
    }

    override save(pushSubscription: PushSubscription): Promise<void> {
        return Promise.resolve().then(() => {
            const concurrent = this.concurrentSave;
            this.concurrentSave = null;
            if (concurrent !== null) this.store(concurrent);
            this.store(pushSubscription.toSnapshot());
        });
    }

    override findByEndpoint(
        coupleId: string,
        endpoint: string,
    ): Promise<PushSubscription | null> {
        return this.findOne(
            (s) => s.coupleId === coupleId && s.endpoint === endpoint,
        );
    }

    override findOfOwner(
        coupleId: string,
        ownerId: string,
        endpoint: string,
    ): Promise<PushSubscription | null> {
        return this.findOne(
            (s) =>
                s.coupleId === coupleId &&
                s.ownerId === ownerId &&
                s.endpoint === endpoint,
        );
    }

    override findOfCouples(
        coupleIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<PushSubscription>> {
        return Promise.resolve(
            this.storedSnapshots
                .filter(({ coupleId }) => coupleIds.includes(coupleId))
                .map((s) => PushSubscription.fromSnapshot(structuredClone(s))),
        );
    }

    override forget(
        pushSubscriptions: ReadonlyArray<PushSubscription>,
    ): Promise<void> {
        const forgotten = pushSubscriptions.map(
            (s) => `${s.coupleId}:${s.id.getValue()}`,
        );
        this.snapshots = new Map(
            [...this.snapshots].filter(
                ([id, s]) => !forgotten.includes(`${s.coupleId}:${id}`),
            ),
        );
        return Promise.resolve();
    }

    private findOne(
        matches: (snapshot: PushSubscriptionSnapshot) => boolean,
    ): Promise<PushSubscription | null> {
        const found = this.storedSnapshots.find(matches) ?? null;
        return Promise.resolve(
            found === null
                ? null
                : PushSubscription.fromSnapshot(structuredClone(found)),
        );
    }

    private store(snapshot: PushSubscriptionSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        const sameEndpoint = this.storedSnapshots.some(
            (s) =>
                s.id !== snapshot.id &&
                s.coupleId === snapshot.coupleId &&
                s.endpoint === snapshot.endpoint,
        );
        if (sameEndpoint) throw versionConflict();
        if (stored !== null && stored.version !== snapshot.version) {
            throw versionConflict();
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
