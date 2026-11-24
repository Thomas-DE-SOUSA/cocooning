import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import type { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { PushSubscriptionRepository } from '../../domain/ports/push-subscription.repository';
import type { PushSubscriptionRegistrationService } from '../../domain/services/push-subscription-registration.service';
import { PushEndpoint } from '../../domain/value-objects/push-endpoint.vo';
import { PushSubscriptionKeys } from '../../domain/value-objects/push-subscription-keys.vo';

export type SubscribePushNotificationsCommand = {
    readonly endpoint: string;
    readonly keys: { readonly p256dh: string; readonly auth: string };
};

// R11: a phone of the partner allows the notifications; idempotent on the endpoint.
export class SubscribePushNotificationsUseCase {
    constructor(
        private readonly pushSubscriptionRepository: PushSubscriptionRepository,
        private readonly pushSubscriptionRegistrationService: PushSubscriptionRegistrationService,
        private readonly dateTimeProvider: DateTimeProvider,
    ) {}

    async execute(
        context: ExecutionContext,
        command: SubscribePushNotificationsCommand,
    ): Promise<void> {
        const endpoint = PushEndpoint.create(command.endpoint);
        const keys = PushSubscriptionKeys.create(command.keys);
        const subscription =
            await this.pushSubscriptionRegistrationService.subscriptionFor(
                context,
                endpoint,
                keys,
                this.dateTimeProvider.now(),
            );
        await this.pushSubscriptionRepository.save(subscription);
    }
}
