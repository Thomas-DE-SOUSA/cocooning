import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type {
    DateTimeProvider,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';
import { NoteCard } from '../../domain/models/note-card.aggregate';
import { Note } from '../../domain/models/note.aggregate';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NoteRepository } from '../../domain/ports/note.repository';
import type { CardContextService } from '../../domain/services/card-context.service';
import type { FolderPreconditionService } from '../../domain/services/folder-precondition.service';
import { NoteCardQuery } from '../../domain/value-objects/note-card-query.vo';
import { NoteTitle } from '../../domain/value-objects/note-title.vo';
import {
    type NoteDetailView,
    toNoteDetailView,
} from '../mappers/note-detail-view.mapper';

export type AddNoteCardCommand = {
    readonly folderId: string;
    readonly name: string;
};

// R19, R20, R23: the name typed in a smart folder becomes a note of its space, created at once with its card
// « en recherche »; the background task fills it, within the daily limit, and never creates another note.
export class AddNoteCardUseCase {
    constructor(
        private readonly noteRepository: NoteRepository,
        private readonly noteCardRepository: NoteCardRepository,
        private readonly folderPreconditionService: FolderPreconditionService,
        private readonly cardContextService: CardContextService,
        private readonly unitOfWork: UnitOfWork,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: AddNoteCardCommand,
    ): Promise<NoteDetailView> {
        const title = NoteTitle.create(command.name);
        const query = NoteCardQuery.create(command.name);
        const folder = await this.folderPreconditionService.loadVisibleFolder(
            context,
            command.folderId,
        );
        const { settings } = await this.cardContextService.loadCardContext(
            context.coupleId,
            command.folderId,
        );
        const now = this.dateTimeProvider.now();
        const note = Note.create(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                title,
                space: folder.space,
                folder,
            },
            now,
        );
        const card = NoteCard.create(
            {
                coupleId: context.coupleId,
                noteId: note.id,
                requestedBy: context.userId,
                query,
                template: settings.template,
            },
            now,
        );
        await this.unitOfWork.run(async () => {
            await this.noteRepository.save(note);
            await this.noteCardRepository.save(card);
        });
        await this.eventPublishingService.publishAndClear([note, card]);
        return toNoteDetailView(note, card, context.userId);
    }
}
