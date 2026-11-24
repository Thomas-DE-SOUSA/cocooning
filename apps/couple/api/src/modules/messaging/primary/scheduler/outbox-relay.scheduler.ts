import {
    Injectable,
    type OnApplicationBootstrap,
    type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RelayOutboxEventsUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';

// R10: a notification follows its event within seconds; the interval never differs between environments (core.md rule 8).
export const OUTBOX_RELAY_TICK_INTERVAL_MS = 5_000;

// Primary adapter of the outbox relay, inside the API process (decision 0021, D6): no worker, no queue.
// A tick never overlaps the previous one; the row locks of the claim keep a second process off the same events.
@Injectable()
export class OutboxRelayScheduler
    implements OnApplicationBootstrap, OnModuleDestroy
{
    private timer: NodeJS.Timeout | null = null;
    private running: Promise<void> | null = null;

    constructor(
        private readonly relayOutboxEvents: RelayOutboxEventsUseCase,
        private readonly config: ConfigService<Environment, true>,
        private readonly logger: Logger,
    ) {
        this.logger.setContext(OutboxRelayScheduler.name);
    }

    // Disabled in the E2E tests, which call tick() themselves.
    onApplicationBootstrap(): void {
        const enabled = this.config.getOrThrow('OUTBOX_RELAY_ENABLED', {
            infer: true,
        });
        if (!enabled) return;
        this.timer = setInterval(() => {
            void this.tick();
        }, OUTBOX_RELAY_TICK_INTERVAL_MS);
        this.timer.unref();
    }

    async onModuleDestroy(): Promise<void> {
        if (this.timer !== null) clearInterval(this.timer);
        this.timer = null;
        await this.running;
    }

    // A failed tick rolls its batch back: logged, retried by the next one; it never stops the API.
    async tick(): Promise<void> {
        if (this.running !== null) return;
        this.running = this.runOnce();
        await this.running;
        this.running = null;
    }

    private async runOnce(): Promise<void> {
        try {
            await this.relayOutboxEvents.execute();
        } catch (error) {
            this.logger.error('Outbox relay tick failed', { error });
        }
    }
}
