import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { NoteCardRepository } from '../../domain/ports/note-card.repository';
import type { NoteCardEnrichmentService } from '../../domain/services/note-card-enrichment.service';

// Run by the background task of the API (decision 0054), for no partner: no context, no command.
export class EnrichPendingNoteCardsUseCase {
    constructor(
        private readonly noteCardRepository: NoteCardRepository,
        private readonly noteCardEnrichmentService: NoteCardEnrichmentService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
        private readonly batchSize: number,
    ) {}

    // R20 to R23: a few cards « en recherche », filled one after the other, each saved as soon as it is done.
    async execute(): Promise<void> {
        const now = this.dateTimeProvider.now();
        const cards = await this.noteCardRepository.claimPending(
            this.batchSize,
            now,
        );
        await this.noteCardEnrichmentService.enrichAll(cards, now);
        await this.eventPublishingService.publishAndClear(cards);
    }
}
