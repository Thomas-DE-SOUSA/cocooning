import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

export class NoteDeletedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.note.deleted' as const;

    constructor(params: NoteEventParams<null>) {
        super(toDomainEventParams(NoteDeletedEvent.EVENT_NAME, params));
    }
}
