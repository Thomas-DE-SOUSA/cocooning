import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import {
    type NoteDetailView,
    toNoteDetailView,
} from '../mappers/note-detail-view.mapper';

export type GetNoteCommand = {
    readonly noteId: string;
};

// R4: one note the partner sees, opened from the list; the private note of the other is NOTE_NOT_FOUND.
// R20: with its card on top when it has one.
export class GetNoteUseCase {
    constructor(
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCardRepository: NoteCardRepository,
    ) {}

    async execute(
        context: ExecutionContext,
        command: GetNoteCommand,
    ): Promise<NoteDetailView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const card = await this.noteCardRepository.findByNoteId(
            context.coupleId,
            command.noteId,
        );
        return toNoteDetailView(note, card, context.userId);
    }
}
