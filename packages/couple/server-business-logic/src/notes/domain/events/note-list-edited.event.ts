import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

// The title and the emoji belong to the couple: the event carries neither (core.md rule 33).
export class NoteListEditedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.note.list-edited' as const;

    constructor(params: NoteEventParams<null>) {
        super(toDomainEventParams(NoteListEditedEvent.EVENT_NAME, params));
    }
}
