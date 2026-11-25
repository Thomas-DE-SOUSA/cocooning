import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type NoteCardEventParams,
    toNoteCardDomainEventParams,
} from './note-card-event-params';

// R19, R20, R22: a search is asked for; the query and the values belong to the couple, never in an event (core.md rule 33).
export type NoteCardRequestedData = {
    readonly noteId: string;
    readonly status: NoteCardStatus;
};

export class NoteCardRequestedEvent extends DomainEventBase<NoteCardRequestedData> {
    static readonly EVENT_NAME = 'notes.note-card.requested' as const;

    constructor(params: NoteCardEventParams<NoteCardRequestedData>) {
        super(
            toNoteCardDomainEventParams(
                NoteCardRequestedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
