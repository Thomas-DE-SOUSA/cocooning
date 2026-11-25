import {
    type NoteSpace,
    type NoteVisibility,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { NoteCreatedEvent } from '../events/note-created.event';
import { NoteDeletedEvent } from '../events/note-deleted.event';
import { NoteMadePrivateEvent } from '../events/note-made-private.event';
import type { NoteEventParams } from '../events/note-event-params';
import { NoteMovedEvent } from '../events/note-moved.event';
import { NoteRenamedEvent } from '../events/note-renamed.event';
import { NoteSharedEvent } from '../events/note-shared.event';
import { FolderPlacementValidator } from '../services/folder-placement.validator';
import { NoteAccessValidator } from '../services/note-access.validator';
import { FolderId } from '../value-objects/folder-id.vo';
import { NoteId } from '../value-objects/note-id.vo';
import { NoteTitle } from '../value-objects/note-title.vo';
import type { FolderPlace } from './folder.aggregate.type';
import type {
    CreateNoteInput,
    NoteProps,
    NoteSnapshot,
} from './note.aggregate.type';
import { visibilityOfSpace } from './note-space';

const INITIAL_VERSION = 1;

export class Note extends AggregateRoot {
    private constructor(private readonly props: NoteProps) {
        super();
    }

    // R1, R2, R11: the creator owns the note, which takes the visibility of its space.
    static create(input: CreateNoteInput, now: Date): Note {
        FolderPlacementValidator.ensureInSpace(input.folder, input.space);
        const visibility = visibilityOfSpace(input.space);
        const note = new Note({
            id: NoteId.generate(),
            coupleId: input.coupleId,
            ownerId: input.ownerId,
            title: input.title,
            visibility,
            folderId: input.folder === null ? null : input.folder.id,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        note.addDomainEvent(
            new NoteCreatedEvent(
                note.eventParams(input.ownerId, now, {
                    ownerId: input.ownerId,
                    visibility,
                }),
            ),
        );
        return note;
    }

    static fromSnapshot(snapshot: NoteSnapshot): Note {
        return new Note({
            id: NoteId.from(snapshot.id),
            coupleId: snapshot.coupleId,
            ownerId: snapshot.ownerId,
            title: NoteTitle.from(snapshot.title),
            visibility: snapshot.visibility,
            folderId:
                snapshot.folderId === null
                    ? null
                    : FolderId.from(snapshot.folderId),
            version: snapshot.version,
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R6: whoever sees the note renames it; the repository only hands out visible notes (R4).
    rename(userId: string, title: NoteTitle, now: Date): void {
        this.props.title = title;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new NoteRenamedEvent(this.eventParams(userId, now, null)),
        );
    }

    // R5: only the owner changes the visibility.
    share(userId: string, now: Date): void {
        this.changeVisibility(userId, NoteVisibilityEnum.SHARED, now);
    }

    makePrivate(userId: string, now: Date): void {
        this.changeVisibility(userId, NoteVisibilityEnum.PRIVATE, now);
    }

    // R11: within its space by whoever sees it; to the other space by its owner only, as with R5.
    moveTo(
        userId: string,
        space: NoteSpace,
        folder: FolderPlace | null,
        now: Date,
    ): void {
        FolderPlacementValidator.ensureInSpace(folder, space);
        const visibility = visibilityOfSpace(space);
        if (visibility !== this.props.visibility)
            this.changeVisibility(userId, visibility, now);
        this.props.folderId = folder === null ? null : folder.id;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        this.addDomainEvent(
            new NoteMovedEvent(
                this.eventParams(userId, now, {
                    folderId: this.folderIdValue(),
                }),
            ),
        );
    }

    // R7: only the owner deletes the note, softly.
    delete(userId: string, now: Date): void {
        NoteAccessValidator.ensureOwner(this.props.ownerId, userId);
        this.props.metadata = this.props.metadata.recordDeletion(now);
        this.addDomainEvent(
            new NoteDeletedEvent(this.eventParams(userId, now, null)),
        );
    }

    get id(): NoteId {
        return this.props.id;
    }

    get ownerId(): string {
        return this.props.ownerId;
    }

    get title(): NoteTitle {
        return this.props.title;
    }

    get visibility(): NoteVisibility {
        return this.props.visibility;
    }

    get folderId(): FolderId | null {
        return this.props.folderId;
    }

    get updatedAt(): Date {
        return this.props.metadata.updatedAt;
    }

    toSnapshot(): NoteSnapshot {
        return {
            id: this.props.id.getValue(),
            coupleId: this.props.coupleId,
            ownerId: this.props.ownerId,
            title: this.props.title.value,
            visibility: this.props.visibility,
            folderId: this.folderIdValue(),
            version: this.props.version,
            metadata: this.props.metadata.toSnapshot(),
        };
    }

    private changeVisibility(
        userId: string,
        visibility: NoteVisibility,
        now: Date,
    ): void {
        NoteAccessValidator.ensureOwner(this.props.ownerId, userId);
        // R11: a folder belongs to one space, so a note that changes space goes to the root of the other.
        if (visibility !== this.props.visibility) this.props.folderId = null;
        this.props.visibility = visibility;
        this.props.metadata = this.props.metadata.recordUpdate(now);
        const params = this.eventParams(userId, now, null);
        this.addDomainEvent(
            visibility === NoteVisibilityEnum.SHARED
                ? new NoteSharedEvent(params)
                : new NoteMadePrivateEvent(params),
        );
    }

    private folderIdValue(): string | null {
        const folder = this.props.folderId;
        return folder === null ? null : folder.getValue();
    }

    private eventParams<TData>(
        userId: string,
        now: Date,
        data: TData,
    ): NoteEventParams<TData> {
        return {
            coupleId: this.props.coupleId,
            userId,
            noteId: this.props.id.getValue(),
            occurredAt: now,
            data,
        };
    }
}
