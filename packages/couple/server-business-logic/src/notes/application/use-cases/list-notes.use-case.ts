import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { NoteRepository } from '../../domain/ports/note.repository';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export class ListNotesUseCase {
    constructor(private readonly noteRepository: NoteRepository) {}

    // R4: the shared notes of the couple and the partner's own private notes.
    async execute(context: ExecutionContext): Promise<NoteView[]> {
        const notes = await this.noteRepository.findVisible(
            context.coupleId,
            context.userId,
        );
        return notes.map(toNoteView);
    }
}
