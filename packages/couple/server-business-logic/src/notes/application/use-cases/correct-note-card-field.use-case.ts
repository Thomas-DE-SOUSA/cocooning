import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NoteCardPreconditionService } from '../../domain/services/note-card-precondition.service';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import {
    type NoteCardView,
    toNoteCardView,
} from '../mappers/note-card-view.mapper';

export type CorrectNoteCardFieldCommand = {
    readonly noteId: string;
    readonly name: string;
    readonly value: string;
};

// R22: whoever sees the note corrects one field by hand; every later search keeps it.
export class CorrectNoteCardFieldUseCase {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCardPreconditionService: NoteCardPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: CorrectNoteCardFieldCommand,
    ): Promise<NoteCardView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const card = await this.noteCardPreconditionService.loadCardOf(note);
        card.correctField(
            context.userId,
            command.name,
            command.value,
            this.dateTimeProvider.now(),
        );
        await this.noteCardRepository.save(card);
        await this.eventPublishingService.publishAndClear([card]);
        return toNoteCardView(card);
    }
}
