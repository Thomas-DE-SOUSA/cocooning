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

export type ChooseNoteCardCandidateCommand = {
    readonly noteId: string;
    readonly candidateIndex: number;
};

// R19: whoever sees the note chooses one of the candidates; the card searches again with it.
export class ChooseNoteCardCandidateUseCase {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly notePreconditionService: NotePreconditionService,
        private readonly noteCardPreconditionService: NoteCardPreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: ChooseNoteCardCandidateCommand,
    ): Promise<NoteCardView> {
        const note = await this.notePreconditionService.loadVisibleNote(
            context,
            command.noteId,
        );
        const card = await this.noteCardPreconditionService.loadCardOf(note);
        card.chooseCandidate(
            context.userId,
            command.candidateIndex,
            this.dateTimeProvider.now(),
        );
        await this.noteCardRepository.save(card);
        await this.eventPublishingService.publishAndClear([card]);
        return toNoteCardView(card);
    }
}
