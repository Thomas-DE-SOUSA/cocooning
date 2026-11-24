import type { SecureRandomGenerator } from '@cocooning/shared-kernel/ports';
import { PhotoPrompt } from '../models/photo-prompt.aggregate';
import type { PhotoPromptRepository } from '../ports/photo-prompt.repository';
import { coupleCalendarDayAt } from '../value-objects/couple-time';

export class PhotoPromptScheduleService {
    constructor(
        private readonly photoPromptRepository: PhotoPromptRepository,
        private readonly secureRandomGenerator: SecureRandomGenerator,
    ) {}

    // R7: today's prompt is drawn for every formed couple that has none, then issued once its time has come.
    // Returns only the prompts that changed, to save; one read for all couples (core.md rule 9).
    async promptsToSave(
        coupleIds: ReadonlyArray<string>,
        now: Date,
    ): Promise<ReadonlyArray<PhotoPrompt>> {
        const day = coupleCalendarDayAt(now);
        const drawn = await this.photoPromptRepository.findOfDay(
            coupleIds,
            day,
        );
        const prompted = new Set(drawn.map((prompt) => prompt.coupleId));
        const newlyDrawn = coupleIds
            .filter((coupleId) => !prompted.has(coupleId))
            .map((coupleId) =>
                PhotoPrompt.draw(
                    { coupleId, day },
                    this.secureRandomGenerator,
                    now,
                ),
            );
        const prompts = [...drawn, ...newlyDrawn];
        prompts.forEach((prompt) => prompt.issueIfDue(now));
        return prompts.filter((prompt) => prompt.hasUncommittedEvents());
    }
}
