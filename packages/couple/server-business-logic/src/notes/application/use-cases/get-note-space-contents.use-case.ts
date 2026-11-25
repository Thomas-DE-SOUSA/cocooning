import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { FolderRepository } from '../../domain/ports/folder.repository';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { CardContextService } from '../../domain/services/card-context.service';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import {
    type NoteSpaceContentsView,
    toNoteSpaceContentsView,
} from '../mappers/note-space-contents-view.mapper';

export type GetNoteSpaceContentsCommand = {
    readonly space: NoteSpace;
    readonly folderId: string | null;
};

// R10, R14: the root of a space or one of its folders, with the way back to the root; the other's « Privé » is not found.
// R18, R20: in a smart tree, the template it reads, and the card of each note.
export class GetNoteSpaceContentsUseCase {
    constructor(
        private readonly folderRepository: FolderRepository,
        private readonly noteRepository: NoteRepository,
        private readonly noteCardRepository: NoteCardRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly cardContextService: CardContextService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: GetNoteSpaceContentsCommand,
    ): Promise<NoteSpaceContentsView> {
        const { coupleId, userId } = context;
        await this.folderPreconditionService.loadDestination(
            context,
            command.space,
            command.folderId,
        );
        const path = await this.folderRepository.findPath(
            coupleId,
            command.folderId,
        );
        const folders = await this.folderRepository.findVisibleChildren(
            coupleId,
            userId,
            command.space,
            command.folderId,
        );
        const notes = await this.noteRepository.findVisibleIn(
            coupleId,
            userId,
            command.space,
            command.folderId,
        );
        const contents = {
            space: command.space,
            path,
            cardContext: await this.cardContextService.findCardContext(
                coupleId,
                command.folderId,
            ),
            folders,
            folderCounts: await this.folderRepository.countVisibleChildren(
                coupleId,
                userId,
                folders,
            ),
            noteCounts: await this.noteRepository.countVisibleByFolder(
                coupleId,
                userId,
                folders,
            ),
            notes,
            cards: await this.noteCardRepository.findByNoteIds(
                coupleId,
                notes.map((note) => note.id.getValue()),
            ),
        };
        return toNoteSpaceContentsView(contents, userId);
    }
}
