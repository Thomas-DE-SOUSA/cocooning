import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteContentRepository } from '../../domain/ports/note-content.repository';

export type SaveNoteDocumentCommand = {
    readonly noteId: string;
    readonly content: Uint8Array;
};

// Access was checked when the editor connected (AuthorizeNoteDocumentUseCase); the write stays within the couple.
export class SaveNoteDocumentUseCase {
    constructor(
        private readonly noteContentRepository: NoteContentRepository,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async execute(
        context: ExecutionContext,
        command: SaveNoteDocumentCommand,
    ): Promise<void> {
        await this.noteContentRepository.saveContent(
            context.coupleId,
            command.noteId,
            command.content,
            this.dateTimeProvider.now(),
        );
    }
}
