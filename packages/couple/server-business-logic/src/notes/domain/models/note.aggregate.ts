import {
    type NoteVisibility,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { NoteCreatedEvent } from '../events/note-created.event';
import { NoteDeletedEvent } from '../events/note-deleted.event';
import { NoteMadePrivateEvent } from '../events/note-made-private.event';
import type { NoteEventParams } from '../events/note-event-params';
import { NoteRenamedEvent } from '../events/note-renamed.event';
import { NoteSharedEvent } from '../events/note-shared.event';
import { NoteAccessValidator } from '../services/note-access.validator';
import { NoteId } from '../value-objects/note-id.vo';
import { NoteTitle } from '../value-objects/note-title.vo';
import type {
    CreateNoteInput,
    NoteProps,
    NoteSnapshot,
} from './note.aggregate.type';

const INITIAL_VERSION = 1;

export class Note extends AggregateRoot {
    private constructor(private readonly props: NoteProps) {
        super();
    }

    // R1, R2: the creator owns the note, shared from the start.
    static create(input: CreateNoteInput, now: Date): Note {
        const note = new Note({
            id: NoteId.generate(),
            coupleId: input.coupleId,
            ownerId: input.ownerId,
            title: input.title,
            visibility: NoteVisibilityEnum.SHARED,
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
        note.addDomainEvent(
            new NoteCreatedEvent(
                note.eventParams(input.ownerId, now, {
                    ownerId: input.ownerId,
                    visibility: NoteVisibilityEnum.SHARED,
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
        this.addDomainEvent(
            new NoteSharedEvent(this.eventParams(userId, now, null)),
        );
    }

    makePrivate(userId: string, now: Date): void {
        this.changeVisibility(userId, NoteVisibilityEnum.PRIVATE, now);
        this.addDomainEvent(
            new NoteMadePrivateEvent(this.eventParams(userId, now, null)),
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
        this.props.visibility = visibility;
        this.props.metadata = this.props.metadata.recordUpdate(now);
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
