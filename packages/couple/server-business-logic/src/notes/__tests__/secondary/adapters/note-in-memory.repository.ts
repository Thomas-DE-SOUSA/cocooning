import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import type {
    DomainEvent,
    OffsetPage,
    OffsetPaginationParams,
} from '@cocooning/shared-kernel/domain';
import { NoteException } from '../../../domain/exceptions/note.exception';
import { Note } from '../../../domain/models/note.aggregate';
import type { NoteSnapshot } from '../../../domain/models/note.aggregate.type';
import { NoteRepository } from '../../../domain/ports/note.repository';

const FIRST_VERSION = 1;

const isVisibleTo =
    (coupleId: string, userId: string) =>
    (snapshot: NoteSnapshot): boolean =>
        snapshot.coupleId === coupleId &&
        snapshot.metadata.deletedAt === null &&
        (snapshot.visibility === NoteVisibilityEnum.SHARED ||
            snapshot.ownerId === userId);

const byMostRecentChange = (left: NoteSnapshot, right: NoteSnapshot): number =>
    right.metadata.updatedAt.localeCompare(left.metadata.updatedAt);

// Mimics the adapter: optimistic version, outbox, visibility filtered as the query does (R4).
export class NoteInMemoryRepository extends NoteRepository {
    private snapshots: ReadonlyMap<string, NoteSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: Note | null = null;

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<NoteSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(note: Note): void {
        this.store(note.toSnapshot());
    }

    simulateConcurrentSave(note: Note): void {
        this.concurrentSave = note;
    }

    override save(note: Note): Promise<void> {
        return Promise.resolve().then(() => this.write(note));
    }

    override findVisibleById(
        coupleId: string,
        userId: string,
        noteId: string,
    ): Promise<Note | null> {
        const found = this.storedSnapshots
            .filter(isVisibleTo(coupleId, userId))
            .find(({ id }) => id === noteId);
        return Promise.resolve(
            found === undefined ? null : this.rebuild(found),
        );
    }

    override findVisible(
        coupleId: string,
        userId: string,
        { page, pageSize }: OffsetPaginationParams,
    ): Promise<OffsetPage<Note>> {
        const visible = this.storedSnapshots
            .filter(isVisibleTo(coupleId, userId))
            .sort(byMostRecentChange);
        const start = (page - 1) * pageSize;
        return Promise.resolve({
            items: visible
                .slice(start, start + pageSize)
                .map((snapshot) => this.rebuild(snapshot)),
            total: visible.length,
            page,
            pageSize,
        });
    }

    private write(note: Note): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(note.toSnapshot());
        this.outbox = [...this.outbox, ...note.getDomainEvents()];
    }

    private rebuild(snapshot: NoteSnapshot): Note {
        return Note.fromSnapshot(structuredClone(snapshot));
    }

    private store(snapshot: NoteSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
                message: 'In-memory NOTE_VERSION_CONFLICT',
            });
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
