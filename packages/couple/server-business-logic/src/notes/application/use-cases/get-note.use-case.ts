import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type GetNoteCommand = {
    readonly noteId: string;
};

// R4: one note the partner sees, opened from the list; the private note of the other is NOTE_NOT_FOUND.
export class GetNoteUseCase {
    constructor(
        private readonly notePreconditionService: NotePreconditionService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: GetNoteCommand,
    ): Promise<NoteView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        return toNoteView(note, context.userId);
    }
}
