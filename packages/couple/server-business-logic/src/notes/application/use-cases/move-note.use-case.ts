import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import type { NoteRevocationService } from '../../domain/services/note-revocation.service';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type MoveNoteCommand = {
    readonly noteId: string;
    readonly space: NoteSpace;
    readonly folderId: string | null;
};

// R11: into a folder or a space root; into the other space by the owner only, which shares it or makes it private.
export class MoveNoteUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly noteRevocationService: NoteRevocationService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: MoveNoteCommand,
    ): Promise<NoteView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const folder = await this.folderPreconditionService.loadDestination(
            context,
            command.space,
            command.folderId,
        );
        note.moveTo(
            context.userId,
            command.space,
            folder,
            this.dateTimeProvider.now(),
        );
        await this.noteRepository.save(note);
        await this.eventPublishingService.publishAndClear([note]);
        await this.noteRevocationService.disconnectThoseWhoLostIt(note);
        return toNoteView(note, context.userId);
    }
}
