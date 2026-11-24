import type { EventPublishingService } from '@cocooning/shared-kernel/application';
import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { FlashMessageRepository } from '../../domain/ports/flash-message.repository';
import type { FlashMessagePreconditionService } from '../../domain/services/flash-message-precondition.service';

export type WithdrawFlashMessageCommand = {
    readonly flashMessageId: string;
};

export class WithdrawFlashMessageUseCase {
    constructor(
        private readonly flashMessageRepository: FlashMessageRepository,
        private readonly flashMessagePreconditionService: FlashMessagePreconditionService,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly eventPublishingService: EventPublishingService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: WithdrawFlashMessageCommand,
    ): Promise<void> {
        const flashMessage =
            await this.flashMessagePreconditionService.loadFlashMessage(
                context,
                command.flashMessageId,
            );
        flashMessage.withdraw(context.userId, this.dateTimeProvider.now());
        await this.flashMessageRepository.save(flashMessage);
        await this.eventPublishingService.publishAndClear([flashMessage]);
    }
}
