import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type RenameNoteCommand = {
    readonly noteId: string;
    readonly title: string;
};

export class RenameNoteUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: RenameNoteCommand,
    ): Promise<NoteView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const title = NoteTitle.create(command.title);
        note.rename(context.userId, title, this.dateTimeProvider.now());
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        return toNoteView(note);
    }
}
