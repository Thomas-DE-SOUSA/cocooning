import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

export class NoteSharedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.note.shared' as const;

    constructor(params: NoteEventParams<null>) {
        super(toDomainEventParams(NoteSharedEvent.EVENT_NAME, params));
    }
}
