import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type NoteCardEventParams,
    toNoteCardDomainEventParams,
} from './note-card-event-params';

// R19 to R23: the search ended in this status.
export type NoteCardSearchedData = {
    readonly noteId: string;
    readonly status: NoteCardStatus;
};

export class NoteCardSearchedEvent extends DomainEventBase<NoteCardSearchedData> {
    static readonly EVENT_NAME = 'notes.note-card.searched' as const;

    constructor(params: NoteCardEventParams<NoteCardSearchedData>) {
        super(
            toNoteCardDomainEventParams(
                NoteCardSearchedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
