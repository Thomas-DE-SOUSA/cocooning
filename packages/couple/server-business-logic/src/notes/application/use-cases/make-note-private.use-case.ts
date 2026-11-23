import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteCollaborationProvider } from '../../domain/ports/note-collaboration.provider';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type MakeNotePrivateCommand = {
    readonly noteId: string;
};

export class MakeNotePrivateUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCollaborationProvider: NoteCollaborationProvider,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: MakeNotePrivateCommand,
    ): Promise<NoteView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        note.makePrivate(context.userId, this.dateTimeProvider.now());
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        await this.noteCollaborationProvider.disconnectAllBut(
            command.noteId,
            note.ownerId,
        );
        return toNoteView(note);
    }
}
