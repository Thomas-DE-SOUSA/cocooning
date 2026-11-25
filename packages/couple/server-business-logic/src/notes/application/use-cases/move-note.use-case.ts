import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import type { NoteCardRelocationService } from '../../domain/services/note-card-relocation.service';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import type { NoteRevocationService } from '../../domain/services/note-revocation.service';
import { type NoteView, toNoteView } from '../mappers/note-view.mapper';

export type MoveNoteCommand = {
    readonly noteId: string;
    readonly space: NoteSpace;
    readonly folderId: string | null;
};

// R11: into a folder or a space root; into the other space by the owner only, which shares it or makes it private.
// R25: its card takes the template of a smart folder it enters, in the same transaction.
export class MoveNoteUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly noteCardRepository: NoteCardRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly noteRevocationService: NoteRevocationService,
        private readonly noteCardRelocationService: NoteCardRelocationService,
        private readonly unitOfWork: UnitOfWork,
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
        const now = this.dateTimeProvider.now();
        note.moveTo(context.userId, command.space, folder, now);
        const cards = await this.noteCardRelocationService.cardsFollowing(
            note,
            context.userId,
            now,
        );
        await this.unitOfWork.run(async () => {
            await this.noteRepository.save(note);
            await this.noteCardRepository.saveAll(cards);
        });
        await this.eventPublishingService.publishAndClear([note, ...cards]);
        await this.noteRevocationService.disconnectThoseWhoLostIt(note);
        return toNoteView(note, context.userId);
    }
}
