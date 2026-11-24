import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteCollaborationProvider } from '../../domain/ports/note-collaboration.provider';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';

export type DeleteNoteCommand = {
    readonly noteId: string;
};

export class DeleteNoteUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCollaborationProvider: NoteCollaborationProvider,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: DeleteNoteCommand,
    ): Promise<void> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        note.delete(context.userId, this.dateTimeProvider.now());
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        await this.noteCollaborationProvider.disconnectEveryone(command.noteId);
    }
}
