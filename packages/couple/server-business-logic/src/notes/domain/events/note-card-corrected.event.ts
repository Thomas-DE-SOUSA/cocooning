import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type NoteCardEventParams,
    toNoteCardDomainEventParams,
} from './note-card-event-params';

// R22: a field was corrected by hand; neither its name nor its value travel.
export type NoteCardCorrectedData = {
    readonly noteId: string;
    readonly status: NoteCardStatus;
};

export class NoteCardCorrectedEvent extends DomainEventBase<NoteCardCorrectedData> {
    static readonly EVENT_NAME = 'notes.note-card.corrected' as const;

    constructor(params: NoteCardEventParams<NoteCardCorrectedData>) {
        super(
            toNoteCardDomainEventParams(
                NoteCardCorrectedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
