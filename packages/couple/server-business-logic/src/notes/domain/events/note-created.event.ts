import type { NoteVisibility } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import { type NoteEventParams, toDomainEventParams } from './note-event-params';

export type NoteCreatedData = {
    readonly ownerId: string;
    readonly visibility: NoteVisibility;
};

// The title and the content belong to the couple: no event carries them (core.md rule 33).
export class NoteCreatedEvent extends DomainEventBase<NoteCreatedData> {
    static readonly EVENT_NAME = 'notes.note.created' as const;

    constructor(params: NoteEventParams<NoteCreatedData>) {
        super(toDomainEventParams(NoteCreatedEvent.EVENT_NAME, params));
    }
}
