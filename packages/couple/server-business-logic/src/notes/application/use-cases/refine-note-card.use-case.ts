import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NoteCardPreconditionService } from '../../domain/services/note-card-precondition.service';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import { NoteCardQuery } from '../../domain/value-objects/note-card-query.vo';
import {
    type NoteCardView,
    toNoteCardView,
} from '../mappers/note-card-view.mapper';

export type RefineNoteCardCommand = {
    readonly noteId: string;
    readonly query: string;
};

// R19: « je précise »: whoever sees the note types more, and the card searches again.
export class RefineNoteCardUseCase {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCardPreconditionService: NoteCardPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: RefineNoteCardCommand,
    ): Promise<NoteCardView> {
        const query = NoteCardQuery.create(command.query);
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const card = await this.noteCardPreconditionService.loadCardOf(note);
        card.refine(context.userId, query, this.dateTimeProvider.now());
        await this.noteCardRepository.save(card);
        await this.eventPublishingService.publishAndClear([card]);
        return toNoteCardView(card);
    }
}
