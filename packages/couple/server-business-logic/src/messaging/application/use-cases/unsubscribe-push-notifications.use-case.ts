import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { PushSubscriptionRepository } from '../../domain/ports/push-subscription.repository';
import type { PushSubscriptionPreconditionService } from '../../domain/services/push-subscription-precondition.service';
import { PushEndpoint } from '../../domain/value-objects/push-endpoint.vo';

export type UnsubscribePushNotificationsCommand = {
    readonly endpoint: string;
};

// R11: a partner forgets the subscription of one of their own phones.
export class UnsubscribePushNotificationsUseCase {
    constructor(
        private readonly pushSubscriptionRepository: PushSubscriptionRepository,
        private readonly pushSubscriptionPreconditionService: PushSubscriptionPreconditionService,
    ) {}

    async execute(
        context: ExecutionContext,
        command: UnsubscribePushNotificationsCommand,
    ): Promise<void> {
        const subscription =
            await this.pushSubscriptionPreconditionService.loadOwnSubscription(
                context,
                PushEndpoint.create(command.endpoint),
            );
        await this.pushSubscriptionRepository.forget([subscription]);
    }
}
