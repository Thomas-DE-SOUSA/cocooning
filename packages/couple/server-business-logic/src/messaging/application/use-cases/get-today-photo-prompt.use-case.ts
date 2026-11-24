import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { PhotoOfTheDayService } from '../../domain/services/photo-of-the-day.service';
import {
    type TodayPhotoPromptView,
    toTodayPhotoPromptView,
} from '../mappers/today-photo-prompt-view.mapper';

export class GetTodayPhotoPromptUseCase {
    constructor(
        private readonly photoOfTheDayService: PhotoOfTheDayService,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    // R7: the issued prompt of the Paris day, or null; the drawn time is never told before.
    async execute(context: ExecutionContext): Promise<TodayPhotoPromptView> {
        const today = await this.photoOfTheDayService.readToday(
            context.coupleId,
            this.dateTimeProvider.now(),
        );
        return toTodayPhotoPromptView(today, context.userId);
    }
}
