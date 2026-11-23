import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { NoteContentRepository } from '../../domain/ports/note-content.repository';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';

export type LoadNoteDocumentCommand = {
    readonly noteId: string;
};

export class LoadNoteDocumentUseCase {
    constructor(
        private readonly noteContentRepository: NoteContentRepository,
        private readonly notePreconditionService: NotePreconditionService,
    ) {}

    // null: a note nobody has written in yet.
    async execute(
        context: ExecutionContext,
        command: LoadNoteDocumentCommand,
    ): Promise<Uint8Array | null> {
        await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        return this.noteContentRepository.findContent(
            context.coupleId,
            command.noteId,
        );
    }
}
