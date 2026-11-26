import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteChecklistReader } from '../../domain/ports/note-checklist.reader';
import type { NoteContentRepository } from '../../domain/ports/note-content.repository';

export type SaveNoteDocumentCommand = {
    readonly noteId: string;
    readonly content: Uint8Array;
};

// Access was checked when the editor connected (AuthorizeNoteDocumentUseCase); the write stays within the couple.
// R28: the unchecked items are counted at each save, for every note, and stored with the content.
export class SaveNoteDocumentUseCase {
    constructor(
        private readonly noteContentRepository: NoteContentRepository,
        private readonly noteChecklistReader: NoteChecklistReader,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async execute(
        context: ExecutionContext,
        command: SaveNoteDocumentCommand,
    ): Promise<void> {
        const openItemCount = this.noteChecklistReader.countOpenItems(
            command.noteId,
            command.content,
        );
        await this.noteContentRepository.saveContent(
            context.coupleId,
            command.noteId,
            { content: command.content, openItemCount },
            this.dateTimeProvider.now(),
        );
    }
}
