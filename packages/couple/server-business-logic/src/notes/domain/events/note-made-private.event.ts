import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

export class NoteMadePrivateEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.note.made-private' as const;

    constructor(params: NoteEventParams<null>) {
        super(toDomainEventParams(NoteMadePrivateEvent.EVENT_NAME, params));
    }
}
