import type {
    DateTimeProvider,
    UnitOfWork,
} from '@cocooning/shared-kernel/ports';
import type { OutboxEventRepository } from '../../domain/ports/outbox-event.repository';
import type { PushNotificationService } from '../../domain/services/push-notification.service';

// Run by the outbox relay of the API (decision 0021), for no partner: no context, no command.
export class RelayOutboxEventsUseCase {
    constructor(
        private readonly outboxEventRepository: OutboxEventRepository,
        private readonly pushNotificationService: PushNotificationService,
        private readonly unitOfWork: UnitOfWork,
        private readonly dateTimeProvider: DateTimeProvider,
        private readonly batchSize: number,
    ) {}

    // R10: claim a batch, attempt its notifications, then mark it published, in one transaction: at least once.
    async execute(): Promise<void> {
        const now = this.dateTimeProvider.now();
        await this.unitOfWork.run(async () => {
            const events = await this.outboxEventRepository.claimPending(
                this.batchSize,
            );
            await this.pushNotificationService.notify(events);
            await this.outboxEventRepository.markPublished(events, now);
        });
    }
}
