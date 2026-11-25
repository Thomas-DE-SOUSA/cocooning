import { MessagingCoupleGuardService } from '../../application/services/messaging-couple-guard.service';
import { GetInstantPhotoFileUseCase } from '../../application/use-cases/get-instant-photo-file.use-case';
import { ListMessageFeedUseCase } from '../../application/use-cases/list-message-feed.use-case';
import { SendFlashMessageUseCase } from '../../application/use-cases/send-flash-message.use-case';
import { SendInstantPhotoUseCase } from '../../application/use-cases/send-instant-photo.use-case';
import { WithdrawFlashMessageUseCase } from '../../application/use-cases/withdraw-flash-message.use-case';
import { WithdrawInstantPhotoUseCase } from '../../application/use-cases/withdraw-instant-photo.use-case';
import { AnswerPhotoPromptUseCase } from '../../application/use-cases/answer-photo-prompt.use-case';
import { GetTodayPhotoPromptUseCase } from '../../application/use-cases/get-today-photo-prompt.use-case';
import { SchedulePhotoPromptsUseCase } from '../../application/use-cases/schedule-photo-prompts.use-case';
import { MessagingPushFakes } from './messaging-test.push';

// Wires the use cases as the API does; configures the process-wide UUID generator: call `FlashMessageId.resetForTests()` in afterEach.
export class MessagingTestContext extends MessagingPushFakes {
    messagingCoupleGuardService(): MessagingCoupleGuardService {
        return new MessagingCoupleGuardService(this.pairedCoupleProvider);
    }

    sendFlashMessageUseCase(): SendFlashMessageUseCase {
        return new SendFlashMessageUseCase(
            this.flashMessageRepository,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    sendInstantPhotoUseCase(): SendInstantPhotoUseCase {
        return new SendInstantPhotoUseCase(
            this.instantPhotoRepository,
            this.fileStorage,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    listMessageFeedUseCase(): ListMessageFeedUseCase {
        return new ListMessageFeedUseCase(
            this.messageFeedService,
            this.photoOfTheDayService,
        );
    }

    withdrawFlashMessageUseCase(): WithdrawFlashMessageUseCase {
        return new WithdrawFlashMessageUseCase(
            this.flashMessageRepository,
            this.flashMessagePreconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    withdrawInstantPhotoUseCase(): WithdrawInstantPhotoUseCase {
        return new WithdrawInstantPhotoUseCase(
            this.instantPhotoRepository,
            this.instantPhotoPreconditions,
            this.fileStorage,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    getInstantPhotoFileUseCase(): GetInstantPhotoFileUseCase {
        return new GetInstantPhotoFileUseCase(this.instantPhotoPreconditions);
    }

    schedulePhotoPromptsUseCase(): SchedulePhotoPromptsUseCase {
        return new SchedulePhotoPromptsUseCase(
            this.photoPromptRepository,
            this.photoPromptScheduleService,
            this.pairedCoupleProvider,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    getTodayPhotoPromptUseCase(): GetTodayPhotoPromptUseCase {
        return new GetTodayPhotoPromptUseCase(
            this.photoOfTheDayService,
            this.dateTimeProvider,
        );
    }

    answerPhotoPromptUseCase(): AnswerPhotoPromptUseCase {
        return new AnswerPhotoPromptUseCase(
            this.instantPhotoRepository,
            this.photoPromptPreconditions,
            this.fileStorage,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }
}
