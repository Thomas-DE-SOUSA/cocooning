import type {
    ExecutionContext,
    OffsetPage,
    OffsetPaginationParams,
} from '@cocooning/shared-kernel/domain';
import type { NoteRepository } from '../../domain/ports/note.repository';
import { type NoteView, toNoteViewPage } from '../mappers/note-view.mapper';

export type ListNotesCommand = OffsetPaginationParams;

export class ListNotesUseCase {
    constructor(private readonly noteRepository: NoteRepository) {}

    // R4: the shared notes of the couple and the partner's own private notes.
    async execute(
        context: ExecutionContext,
        command: ListNotesCommand,
    ): Promise<OffsetPage<NoteView>> {
        const page = await this.noteRepository.findVisible(
            context.coupleId,
            context.userId,
            command,
        );
        return toNoteViewPage(page);
    }
}
