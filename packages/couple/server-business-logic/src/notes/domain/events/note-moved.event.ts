import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

export type NoteMovedData = {
    readonly folderId: string | null;
};

export class NoteMovedEvent extends DomainEventBase<NoteMovedData> {
    static readonly EVENT_NAME = 'notes.note.moved' as const;

    constructor(params: NoteEventParams<NoteMovedData>) {
        super(toDomainEventParams(NoteMovedEvent.EVENT_NAME, params));
    }
}
