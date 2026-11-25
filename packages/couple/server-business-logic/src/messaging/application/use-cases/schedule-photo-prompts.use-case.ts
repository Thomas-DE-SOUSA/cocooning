import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { PairedCoupleProvider } from '../../domain/ports/paired-couple.provider';
import type { PhotoPromptRepository } from '../../domain/ports/photo-prompt.repository';
import type { PhotoPromptScheduleService } from '../../domain/services/photo-prompt-schedule.service';

// Run by the scheduled task of the API, without a partner: no context, no command.
export class SchedulePhotoPromptsUseCase {
    constructor(
        private readonly photoPromptRepository: PhotoPromptRepository,
        private readonly photoPromptScheduleService: PhotoPromptScheduleService,
        private readonly pairedCoupleProvider: PairedCoupleProvider,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    // R7: draws today's prompt of every formed couple that has none, issues those whose time has come.
    async execute(): Promise<void> {
        const coupleIds = await this.pairedCoupleProvider.findPairedCoupleIds();
        const now = this.dateTimeProvider.now();
        const photoPrompts =
            await this.photoPromptScheduleService.promptsToSave(coupleIds, now);
        await this.photoPromptRepository.saveAll(photoPrompts);
        await this.eventPublishingService.publishAndClear(photoPrompts);
    }
}
