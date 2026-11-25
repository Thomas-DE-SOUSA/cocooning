import {
    Injectable,
    type OnApplicationBootstrap,
    type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnrichPendingNoteCardsUseCase } from '@cocooning/couple-server-business-logic/notes';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';

// Primary adapter of the background task of the cards, inside the API process (decision 0054): no worker, no queue.
// A tick never overlaps the previous one; the reservation of the claim keeps a second process off the same cards.
@Injectable()
export class NoteCardEnrichmentScheduler
    implements OnApplicationBootstrap, OnModuleDestroy
{
    private timer: NodeJS.Timeout | null = null;
    private running: Promise<void> | null = null;

    constructor(
        private readonly enrichPendingNoteCards: EnrichPendingNoteCardsUseCase,
        private readonly config: ConfigService<Environment, true>,
        private readonly logger: Logger,
    ) {
        this.logger.setContext(NoteCardEnrichmentScheduler.name);
    }

    // Disabled in the E2E tests, which call tick() themselves.
    onApplicationBootstrap(): void {
        const enabled = this.config.getOrThrow('NOTE_CARD_ENRICHMENT_ENABLED', {
            infer: true,
        });
        if (!enabled) return;
        const intervalMs = this.config.getOrThrow(
            'NOTE_CARD_ENRICHMENT_INTERVAL_MS',
            { infer: true },
        );
        this.timer = setInterval(() => {
            void this.tick();
        }, intervalMs);
        this.timer.unref();
    }

    async onModuleDestroy(): Promise<void> {
        if (this.timer !== null) clearInterval(this.timer);
        this.timer = null;
        await this.running;
    }

    // A failed tick is logged by its kind and retried by the next one; it never stops the API.
    async tick(): Promise<void> {
        if (this.running !== null) return;
        this.running = this.runOnce();
        await this.running;
        this.running = null;
    }

    private async runOnce(): Promise<void> {
        try {
            await this.enrichPendingNoteCards.execute();
        } catch (error) {
            this.logger.error('Note card enrichment tick failed', { error });
        }
    }
}
