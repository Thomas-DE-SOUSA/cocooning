import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { FolderCreatedEvent } from '../events/folder-created.event';
import { FolderDeletedEvent } from '../events/folder-deleted.event';
import type { FolderEventParams } from '../events/folder-event-params';
import { FolderMovedEvent } from '../events/folder-moved.event';
import { FolderRenamedEvent } from '../events/folder-renamed.event';
import { FolderPlacementValidator } from '../services/folder-placement.validator';
import { FolderId } from '../value-objects/folder-id.vo';
import { FolderName } from '../value-objects/folder-name.vo';
import type {
    CreateFolderInput,
    FolderPlace,
    FolderProps,
    FolderSnapshot,
} from './folder.aggregate.type';
import type { FolderPathItem } from './folder-path-item';

const INITIAL_VERSION = 1;

// R14: whoever sees a folder manages it; the repository hands out only the folders a partner sees.
export class Folder extends AggregateRoot {
    private constructor(private readonly props: FolderProps) {
        super();
    }

    // R13: in a space or in one of its folders.
    static create(input: CreateFolderInput, now: Date): Folder {
        FolderPlacementValidator.ensureInSpace(input.parent, input.space);
        const parentFolderId = input.parent === null ? null : input.parent.id;
        const folder = new Folder({
            id: FolderId.generate(),
            coupleId: input.coupleId,
            ownerId: input.ownerId,
            space: input.space,
            parentFolderId,
            name: input.name,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        folder.addDomainEvent(
            new FolderCreatedEvent(
                folder.eventParams(input.ownerId, now, {
                    ownerId: input.ownerId,
                    space: input.space,
                    parentFolderId: folder.parentFolderIdValue(),
                }),
            ),
        );
        return folder;
    }

    static fromSnapshot(snapshot: FolderSnapshot): Folder {
        return new Folder({
            id: FolderId.from(snapshot.id),
            coupleId: snapshot.coupleId,
            ownerId: snapshot.ownerId,
            space: snapshot.space,
            parentFolderId:
                snapshot.parentFolderId === null
                    ? null
                    : FolderId.from(snapshot.parentFolderId),
            name: FolderName.from(snapshot.name),
            version: snapshot.version,
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    rename(userId: string, name: FolderName, now: Date): void {
        this.props.name = name;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new FolderRenamedEvent(this.eventParams(userId, now, null)),
        );
    }

    // R15: parentPath runs from the root of the space to the new parent.
    moveTo(
        userId: string,
        parent: FolderPlace | null,
        parentPath: ReadonlyArray<FolderPathItem>,
        now: Date,
    ): void {
        FolderPlacementValidator.ensureMovable(
            this.props.id.getValue(),
            this.props.space,
            parent,
            parentPath,
        );
        this.props.parentFolderId = parent === null ? null : parent.id;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new FolderMovedEvent(
                this.eventParams(userId, now, {
                    parentFolderId: this.parentFolderIdValue(),
                }),
            ),
        );
    }

    // R16: softly; its content moves up through the repository, in the same unit of work.
    delete(userId: string, now: Date): void {
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.addDomainEvent(
            new FolderDeletedEvent(this.eventParams(userId, now, null)),
        );
    }

    get id(): FolderId {
        return this.props.id;
    }

    get coupleId(): string {
        return this.props.coupleId;
    }

    get space(): NoteSpace {
        return this.props.space;
    }

    get parentFolderId(): FolderId | null {
        return this.props.parentFolderId;
    }

    get name(): FolderName {
        return this.props.name;
    }

    get updatedAt(): Date {
        return this.props.metadata.updatedAt;
    }

    toSnapshot(): FolderSnapshot {
        return {
            id: this.props.id.getValue(),
            coupleId: this.props.coupleId,
            ownerId: this.props.ownerId,
            space: this.props.space,
            parentFolderId: this.parentFolderIdValue(),
            name: this.props.name.value,
            version: this.props.version,
            metadata: this.props.metadata.toSnapshot(),
        };
    }

    private parentFolderIdValue(): string | null {
        const parent = this.props.parentFolderId;
        return parent === null ? null : parent.getValue();
    }

    private eventParams<TData>(
        userId: string,
        now: Date,
        data: TData,
    ): FolderEventParams<TData> {
        return {
            coupleId: this.props.coupleId,
            userId,
            folderId: this.props.id.getValue(),
            occurredAt: now,
            data,
        };
    }
}
