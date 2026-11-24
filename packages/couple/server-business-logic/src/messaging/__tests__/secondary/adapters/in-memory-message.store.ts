import type {
    DomainEvent,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';

type StoredMessage = {
    readonly id: string;
    readonly coupleId: string;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};

const FIRST_VERSION = 1;

const newestFirst = (left: StoredMessage, right: StoredMessage): number =>
    left.id < right.id ? 1 : -1;

// Mimics a messaging table and its outbox: optimistic version, withdrawn rows and couple filtered as the query does.
export class InMemoryMessageStore<TSnapshot extends StoredMessage> {
    private snapshots: ReadonlyMap<string, TSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: TSnapshot | null = null;

    constructor(private readonly versionConflict: () => Error) {}

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<TSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(snapshot: TSnapshot): void {
        this.store(snapshot);
    }

    simulateConcurrentSave(snapshot: TSnapshot): void {
        this.concurrentSave = snapshot;
    }

    write(snapshot: TSnapshot, events: ReadonlyArray<DomainEvent>): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent);
        this.store(snapshot);
        this.outbox = [...this.outbox, ...events];
    }

    findLive(coupleId: string, id: string): TSnapshot | null {
        return this.live(coupleId).find((stored) => stored.id === id) ?? null;
    }

    findNewest(
        coupleId: string,
        before: string | null,
        count: number,
    ): ReadonlyArray<TSnapshot> {
        return this.live(coupleId)
            .filter(({ id }) => before === null || id < before)
            .sort(newestFirst)
            .slice(0, count);
    }

    private live(coupleId: string): ReadonlyArray<TSnapshot> {
        return this.storedSnapshots
            .filter(
                (stored) =>
                    stored.coupleId === coupleId &&
                    stored.metadata.deletedAt === null,
            )
            .map((stored) => structuredClone(stored));
    }

    private store(snapshot: TSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            throw this.versionConflict();
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
