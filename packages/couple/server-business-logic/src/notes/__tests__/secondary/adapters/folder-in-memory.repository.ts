import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { DomainEvent } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../../../domain/exceptions/note.exception';
import { Folder } from '../../../domain/models/folder.aggregate';
import type { FolderSnapshot } from '../../../domain/models/folder.aggregate.type';
import type { FolderPathItem } from '../../../domain/models/folder-path-item';
import type { NoteSpaceCounts } from '../../../domain/models/note-space';
import { FolderRepository } from '../../../domain/ports/folder.repository';
import { countBy } from './count-by';
import type { NoteInMemoryRepository } from './note-in-memory.repository';

const FIRST_VERSION = 1;

// R14: the folders of « Partagé » and the partner's own « Privé », as the query filters them.
const isVisibleTo =
    (coupleId: string, userId: string) =>
    (snapshot: FolderSnapshot): boolean =>
        snapshot.coupleId === coupleId &&
        snapshot.metadata.deletedAt === null &&
        (snapshot.space === NoteSpaceEnum.SHARED ||
            snapshot.ownerId === userId);

const byName = (left: FolderSnapshot, right: FolderSnapshot): number =>
    left.name.localeCompare(right.name);

// Mimics the adapter: optimistic version, outbox, visibility in the query, the bulk move of R16 on the notes too.
export class FolderInMemoryRepository extends FolderRepository {
    private snapshots: ReadonlyMap<string, FolderSnapshot> = new Map();
    private outbox: ReadonlyArray<DomainEvent> = [];
    private concurrentSave: Folder | null = null;

    constructor(private readonly noteRepository: NoteInMemoryRepository) {
        super();
    }

    get persistedEvents(): ReadonlyArray<DomainEvent> {
        return this.outbox;
    }

    get storedSnapshots(): ReadonlyArray<FolderSnapshot> {
        return [...this.snapshots.values()];
    }

    seed(folder: Folder): void {
        this.store(folder.toSnapshot());
    }

    simulateConcurrentSave(folder: Folder): void {
        this.concurrentSave = folder;
    }

    override save(folder: Folder): Promise<void> {
        return Promise.resolve().then(() => this.write(folder));
    }

    override findVisibleById(
        coupleId: string,
        userId: string,
        folderId: string,
    ): Promise<Folder | null> {
        const found = this.visible(coupleId, userId).find(
            ({ id }) => id === folderId,
        );
        return Promise.resolve(
            found === undefined ? null : this.rebuild(found),
        );
    }

    override findVisibleChildren(
        coupleId: string,
        userId: string,
        space: NoteSpace,
        parentFolderId: string | null,
    ): Promise<ReadonlyArray<Folder>> {
        return Promise.resolve(
            this.visible(coupleId, userId)
                .filter(
                    (snapshot) =>
                        snapshot.space === space &&
                        snapshot.parentFolderId === parentFolderId,
                )
                .sort(byName)
                .map((snapshot) => this.rebuild(snapshot)),
        );
    }

    override findPath(
        coupleId: string,
        folderId: string | null,
    ): Promise<ReadonlyArray<FolderPathItem>> {
        return Promise.resolve(this.pathTo(coupleId, folderId));
    }

    override countVisibleChildren(
        coupleId: string,
        userId: string,
        folders: ReadonlyArray<Folder>,
    ): Promise<ReadonlyMap<string, number>> {
        const folderIds = folders.map((folder) => folder.id.getValue());
        const parents = this.visible(coupleId, userId).flatMap(
            ({ parentFolderId }) =>
                parentFolderId !== null && folderIds.includes(parentFolderId)
                    ? [parentFolderId]
                    : [],
        );
        return Promise.resolve(countBy(parents));
    }

    override countVisibleBySpace(
        coupleId: string,
        userId: string,
    ): Promise<NoteSpaceCounts> {
        const counts = countBy(
            this.visible(coupleId, userId).map(({ space }) => space),
        );
        return Promise.resolve({
            SHARED: counts.get(NoteSpaceEnum.SHARED) ?? 0,
            PRIVATE: counts.get(NoteSpaceEnum.PRIVATE) ?? 0,
        });
    }

    override moveContentUp(folder: Folder): Promise<void> {
        const folderId = folder.id.getValue();
        const parentFolderId =
            folder.parentFolderId === null
                ? null
                : folder.parentFolderId.getValue();
        const moved = this.storedSnapshots
            .filter(
                (snapshot) =>
                    snapshot.coupleId === folder.coupleId &&
                    snapshot.metadata.deletedAt === null &&
                    snapshot.parentFolderId === folderId,
            )
            .map((snapshot): [string, FolderSnapshot] => [
                snapshot.id,
                { ...snapshot, parentFolderId, version: snapshot.version + 1 },
            ]);
        this.snapshots = new Map([...this.snapshots, ...moved]);
        this.noteRepository.moveUpFrom(folder);
        return Promise.resolve();
    }

    private pathTo(
        coupleId: string,
        folderId: string | null,
    ): ReadonlyArray<FolderPathItem> {
        const folder = folderId === null ? null : this.snapshots.get(folderId);
        if (folder === null || folder === undefined) return [];
        if (folder.coupleId !== coupleId || folder.metadata.deletedAt !== null)
            return [];
        return [
            ...this.pathTo(coupleId, folder.parentFolderId),
            { folderId: folder.id, name: folder.name },
        ];
    }

    private visible(coupleId: string, userId: string): FolderSnapshot[] {
        return this.storedSnapshots.filter(isVisibleTo(coupleId, userId));
    }

    private write(folder: Folder): void {
        const concurrent = this.concurrentSave;
        this.concurrentSave = null;
        if (concurrent !== null) this.store(concurrent.toSnapshot());
        this.store(folder.toSnapshot());
        this.outbox = [...this.outbox, ...folder.getDomainEvents()];
    }

    private rebuild(snapshot: FolderSnapshot): Folder {
        return Folder.fromSnapshot(structuredClone(snapshot));
    }

    private store(snapshot: FolderSnapshot): void {
        const stored = this.snapshots.get(snapshot.id) ?? null;
        if (stored !== null && stored.version !== snapshot.version) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
                message: 'In-memory FOLDER_VERSION_CONFLICT',
            });
        }
        const version = stored === null ? FIRST_VERSION : stored.version + 1;
        this.snapshots = new Map([
            ...this.snapshots,
            [snapshot.id, structuredClone({ ...snapshot, version })],
        ]);
    }
}
