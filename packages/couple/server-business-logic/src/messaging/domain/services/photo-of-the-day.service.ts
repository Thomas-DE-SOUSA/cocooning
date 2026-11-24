import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { InstantPhoto } from '../models/instant-photo.aggregate';
import type { MessageFeedItem } from '../models/message-feed-item';
import {
    type AnsweredPhotoPrompts,
    NO_PHOTO_PROMPT_ANSWERED,
    type PhotoPromptOfTheDay,
    photoPromptsAnsweredBy,
} from '../models/photo-of-the-day';
import type { InstantPhotoRepository } from '../ports/instant-photo.repository';
import type { PhotoPromptRepository } from '../ports/photo-prompt.repository';
import { coupleCalendarDayAt } from '../value-objects/couple-time';

const promptIdsOf = (items: ReadonlyArray<MessageFeedItem>): string[] => [
    ...new Set(
        items.flatMap((item) =>
            item instanceof InstantPhoto && item.photoPromptId !== null
                ? [item.photoPromptId]
                : [],
        ),
    ),
];

export class PhotoOfTheDayService {
    constructor(
        private readonly photoPromptRepository: PhotoPromptRepository,
        private readonly instantPhotoRepository: InstantPhotoRepository,
    ) {}

    // R7: the prompt of the Paris day once issued, with its answers; null before, so its time stays secret.
    async readToday(
        coupleId: string,
        now: Date,
    ): Promise<PhotoPromptOfTheDay | null> {
        const [photoPrompt] = await this.photoPromptRepository.findOfDay(
            [coupleId],
            coupleCalendarDayAt(now),
        );
        if (photoPrompt === undefined) return null;
        const issuedAt = photoPrompt.issuedAt;
        if (issuedAt === null) return null;
        const photosOfTheDay = await this.photosOf(coupleId, [
            photoPrompt.id.getValue(),
        ]);
        return { photoPrompt, issuedAt, photosOfTheDay };
    }

    // R9: the prompts the reader answered among the photos of the day of a page; one query, none without such a photo.
    async answeredBy(
        context: ExecutionContext,
        items: ReadonlyArray<MessageFeedItem>,
    ): Promise<AnsweredPhotoPrompts> {
        const photoPromptIds = promptIdsOf(items);
        if (photoPromptIds.length === 0) return NO_PHOTO_PROMPT_ANSWERED;
        const photosOfTheDay = await this.photosOf(
            context.coupleId,
            photoPromptIds,
        );
        return photoPromptsAnsweredBy(context.userId, photosOfTheDay);
    }

    private photosOf(
        coupleId: string,
        photoPromptIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<InstantPhoto>> {
        return this.instantPhotoRepository.findOfPhotoPrompts(
            coupleId,
            photoPromptIds,
        );
    }
}
