import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import { FlashMessage } from '../../domain/models/flash-message.aggregate';
import type { FlashMessageRepository } from '../../domain/ports/flash-message.repository';
import { FlashMessageText } from '../../domain/value-objects/flash-message-text.vo';
import {
    type FlashMessageView,
    toFlashMessageView,
} from '../mappers/message-feed-item-view.mapper';

export type SendFlashMessageCommand = {
    readonly text: string;
};

export class SendFlashMessageUseCase {
    constructor(
        private readonly flashMessageRepository: FlashMessageRepository,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: SendFlashMessageCommand,
    ): Promise<FlashMessageView> {
        const text = FlashMessageText.create(command.text);
        const flashMessage = FlashMessage.send(
            { coupleId: context.coupleId, ownerId: context.userId, text },
            this.dateTimeProvider.now(),
        );
        await this.flashMessageRepository.save(flashMessage);
        await this.eventPublishingService.publishAndClear([flashMessage]);
        return toFlashMessageView(flashMessage, context.userId);
    }
}
