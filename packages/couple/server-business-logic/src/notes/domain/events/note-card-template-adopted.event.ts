import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import { DomainEventBase } from '@cocooning/shared-kernel/domain';
import {
    type NoteCardEventParams,
    toNoteCardDomainEventParams,
} from './note-card-event-params';

// R22, R25: the card took the template of its folder.
export type NoteCardTemplateAdoptedData = {
    readonly noteId: string;
    readonly status: NoteCardStatus;
};

export class NoteCardTemplateAdoptedEvent extends DomainEventBase<NoteCardTemplateAdoptedData> {
    static readonly EVENT_NAME = 'notes.note-card.template-adopted' as const;

    constructor(params: NoteCardEventParams<NoteCardTemplateAdoptedData>) {
        super(
            toNoteCardDomainEventParams(
                NoteCardTemplateAdoptedEvent.EVENT_NAME,
                params,
            ),
        );
    }
}
