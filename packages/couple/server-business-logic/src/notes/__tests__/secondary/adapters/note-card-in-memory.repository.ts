import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteCardStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../../../domain/exceptions/note.exception';
import { NoteCard } from '../../../domain/models/note-card.aggregate';
import type { NoteCardSnapshot } from '../../../domain/models/note-card.aggregate.type';
import { NoteCardRepository } from '../../../domain/ports/note-card.repository';
import type { FolderInMemoryRepository } from './folder-in-memory.repository';
import type { NoteInMemoryRepository } from './note-in-memory.repository';

const FIRST_VERSION = 1;

// Mimics the adapter: optimistic version, outbox, one card per note, the tree of R22 read over notes and folders.
export class NoteCardInMemoryRepository extends NoteCardRepository {
    private snapshots: ReadonlyMap<string, NoteCardSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: NoteCard | null = null;

    constructor(
        private readonly noteRepository: NoteInMemoryRepository,
        private readonly folderRepository: FolderInMemoryRepository,
    ) {
        super();
    }

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<NoteCardSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(card: NoteCard): void {
        this.store(card.toSnapshot());
    }

    simulateConcurrentSave(card: NoteCard): void {
        this.concurrentSave = card;
    }

    override save(card: NoteCard): Promise<void> {
        return Promise.resolve().then(() => this.write(card));
    }

    override saveAll(cards: ReadonlyArray<NoteCard>): Promise<void> {
        return Promise.resolve().then(() =>
            cards.forEach((card) => this.write(card)),
        );
    }

    override findByNoteId(
        coupleId: string,
        noteId: string,
    ): Promise<NoteCard | null> {
        const found = this.ofCouple(coupleId).find(
            (snapshot) => snapshot.noteId === noteId,
        );
        return Promise.resolve(
            found === undefined ? null : this.rebuild(found),
        );
    }

    override findByNoteIds(
        coupleId: string,
        noteIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<NoteCard>> {
        return Promise.resolve(
            this.ofCouple(coupleId)
                .filter((snapshot) => noteIds.includes(snapshot.noteId))
                .map((snapshot) => this.rebuild(snapshot)),
        );
    }

    override findInTree(
        coupleId: string,
        folderId: string,
    ): Promise<ReadonlyArray<NoteCard>> {
        const folderIds = this.treeOf(coupleId, [folderId]);
        const noteIds = this.noteRepository.storedSnapshots
            .filter(
                (note) =>
                    note.coupleId === coupleId &&
                    note.metadata.deletedAt === null &&
                    note.folderId !== null &&
                    folderIds.includes(note.folderId),
            )
            .map((note) => note.id);
        return this.findByNoteIds(coupleId, noteIds);
    }

    // Every couple, oldest request first, as the adapter; the reservation itself is the adapter's concern.
    override claimPending(limit: number): Promise<ReadonlyArray<NoteCard>> {
        return Promise.resolve(
            this.storedSnapshots
                .filter(
                    (snapshot) =>
                        snapshot.status === NoteCardStatusEnum.PENDING,
                )
                .sort((left, right) =>
                    left.metadata.updatedAt.localeCompare(
                        right.metadata.updatedAt,
                    ),
                )
                .slice(0, limit)
                .map((snapshot) => this.rebuild(snapshot)),
        );
    }

    private treeOf(
        coupleId: string,
        folderIds: ReadonlyArray<string>,
    ): ReadonlyArray<string> {
        const children = this.folderRepository.storedSnapshots
            .filter(
                (folder) =>
                    folder.coupleId === coupleId &&
                    folder.metadata.deletedAt === null &&
                    folder.parentFolderId !== null &&
                    folderIds.includes(folder.parentFolderId) &&
                    !folderIds.includes(folder.id),
            )
            .map((folder) => folder.id);
        return children.length === 0
            ? folderIds
            : this.treeOf(coupleId, [...folderIds, ...children]);
    }

    private ofCouple(coupleId: string): NoteCardSnapshot[] {
        return this.storedSnapshots.filter(
            (snapshot) => snapshot.coupleId === coupleId,
        );
    }

    private write(card: NoteCard): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(card.toSnapshot());
        this.outbox = [...this.outbox, ...card.getDomainEvents()];
    }

    private rebuild(snapshot: NoteCardSnapshot): NoteCard {
        return NoteCard.fromSnapshot(structuredClone(snapshot));
    }

    // The version check and the unique note of the adapter (note_card_couple_id_note_id_key).
    private store(snapshot: NoteCardSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        const sameNote = this.storedSnapshots.some(
            (other) =>
                other.noteId === snapshot.noteId && other.id !== snapshot.id,
        );
        if (
            sameNote ||
            (stored !== null && stored.version !== snapshot.version)
        ) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.NOTE_CARD_VERSION_CONFLICT,
                message: 'In-memory NOTE_CARD_VERSION_CONFLICT',
            });
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
