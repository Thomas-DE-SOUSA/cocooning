import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';
import type { Note } from '../models/note.aggregate';
import type { NoteRepository } from '../ports/note.repository';

export class NotePreconditionService {
    constructor(private readonly noteRepository: NoteRepository) {}

    // R4: unknown, deleted or private to the other partner, the answer is the same.
    async loadVisibleNote(
        context: ExecutionContext,
        noteId: string,
    ): Promise<Note> {
        const note = await this.noteRepository.findVisibleById(
            context.coupleId,
            context.userId,
            noteId,
        );
        if (note !== null) return note;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            message: 'Note not found',
        });
    }
}
