import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

export class NoteRenamedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'notes.note.renamed' as const;

    constructor(params: NoteEventParams<null>) {
        super(toDomainEventParams(NoteRenamedEvent.EVENT_NAME, params));
    }
}
