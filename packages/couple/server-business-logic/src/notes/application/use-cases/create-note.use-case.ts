import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteRepository } from '../../domain/ports/note.repository';
import { Note } from '../../domain/models/note.aggregate';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type CreateNoteCommand = {
    readonly title: string;
    readonly space: NoteSpace;
    readonly folderId: string | null;
};

// R1, R2, R11, R13: in a space or in one of its folders, with the visibility of the space.
export class CreateNoteUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CreateNoteCommand,
    ): Promise<NoteView> {
        const title = NoteTitle.create(command.title);
        const folder = await this.folderPreconditionService.loadDestination(
            context,
            command.space,
            command.folderId,
        );
        const note = Note.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                title,
                space: command.space,
                folder,
            },
            this.dateTimeProvider.now(),
        );
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        return toNoteView(note, context.userId);
    }
}
