import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';

export type AuthorizeNoteDocumentCommand = {
    readonly noteId: string;
};

// R4, R6: an editor opens only a note the partner sees; checked at each connection of the real-time channel.
export class AuthorizeNoteDocumentUseCase {
    constructor(
        private readonly notePreconditionService: NotePreconditionService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: AuthorizeNoteDocumentCommand,
    ): Promise<void> {
        await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
    }
}
