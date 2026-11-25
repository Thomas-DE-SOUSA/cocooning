import {
    Injectable,
    type OnApplicationBootstrap,
    type OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulePhotoPromptsUseCase } from '@cocooning/couple-server-business-logic/messaging';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../../../env';

// R7: the prompt is drawn and issued to the minute; the interval never differs between environments (core.md rule 8).
export const PHOTO_PROMPT_TICK_INTERVAL_MS = 60_000;

// Primary adapter of the scheduled task, inside the API process (decisions 0021, D6): no worker, no queue.
// A tick never overlaps the previous one; the stored state, the unique day and the version guard a restart.
@Injectable()
export class PhotoPromptScheduler
    implements OnApplicationBootstrap, OnModuleDestroy
{
    private timer: NodeJS.Timeout | null = null;
    private running: Promise<void> | null = null;

    constructor(
        private readonly schedulePhotoPrompts: SchedulePhotoPromptsUseCase,
        private readonly config: ConfigService<Environment, true>,
        private readonly logger: Logger,
    ) {
        this.logger.setContext(PhotoPromptScheduler.name);
    }

    // Disabled in the E2E tests, which call tick() on a clock they move.
    onApplicationBootstrap(): void {
        const enabled = this.config.getOrThrow(
            'PHOTO_PROMPT_SCHEDULER_ENABLED',
            { infer: true },
        );
        if (!enabled) return;
        this.timer = setInterval(() => {
            void this.tick();
        }, PHOTO_PROMPT_TICK_INTERVAL_MS);
        this.timer.unref();
    }

    async onModuleDestroy(): Promise<void> {
        if (this.timer !== null) clearInterval(this.timer);
        this.timer = null;
        await this.running;
    }

    // A failed tick is logged and retried by the next one; it never stops the API.
    async tick(): Promise<void> {
        if (this.running !== null) return;
        this.running = this.runOnce();
        await this.running;
        this.running = null;
    }

    private async runOnce(): Promise<void> {
        try {
            await this.schedulePhotoPrompts.execute();
        } catch (error) {
            this.logger.error('Photo prompt tick failed', { error });
        }
    }
}
