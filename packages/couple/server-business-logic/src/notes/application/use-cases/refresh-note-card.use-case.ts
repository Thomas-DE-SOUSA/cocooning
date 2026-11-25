import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { CardContextService } from '../../domain/services/card-context.service';
import type { NoteCardPreconditionService } from '../../domain/services/note-card-precondition.service';
import type { NotePreconditionService } from '../../domain/services/note-precondition.service';
import {
    type NoteCardView,
    toNoteCardView,
} from '../mappers/note-card-view.mapper';

export type RefreshNoteCardCommand = {
    readonly noteId: string;
};

// R20, R22, R25: « Mettre à jour » in a smart folder, with its current template, keeping the fields
// corrected by hand; outside a smart folder the card keeps its values (FOLDER_NOT_SMART).
export class RefreshNoteCardUseCase {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCardPreconditionService: NoteCardPreconditionService,
        private readonly cardContextService: CardContextService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: RefreshNoteCardCommand,
    ): Promise<NoteCardView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const card = await this.noteCardPreconditionService.loadCardOf(note);
        const { settings } =
            await this.cardContextService.loadCardContextOf(note);
        card.refresh(
            context.userId,
            settings.template,
            this.dateTimeProvider.now(),
        );
        await this.noteCardRepository.save(card);
        await this.eventPublishingService.publishAndClear([card]);
        return toNoteCardView(card);
    }
}
