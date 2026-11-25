import type { ExecutionContext } from '@cocooning/shared-kernel/domain';
import { InMemoryUnitOfWork } from '@cocooning/shared-kernel/testing';
import { GetPushPublicKeyUseCase } from '../../application/use-cases/get-push-public-key.use-case';
import { RelayOutboxEventsUseCase } from '../../application/use-cases/relay-outbox-events.use-case';
import { SubscribePushNotificationsUseCase } from '../../application/use-cases/subscribe-push-notifications.use-case';
import { UnsubscribePushNotificationsUseCase } from '../../application/use-cases/unsubscribe-push-notifications.use-case';
import { PushSubscription } from '../../domain/models/push-subscription.aggregate';
import { PushNotificationService } from '../../domain/services/push-notification.service';
import { PushSubscriptionPreconditionService } from '../../domain/services/push-subscription-precondition.service';
import { PushSubscriptionRegistrationService } from '../../domain/services/push-subscription-registration.service';
import { PushEndpoint } from '../../domain/value-objects/push-endpoint.vo';
import { PushSubscriptionKeys } from '../../domain/value-objects/push-subscription-keys.vo';
import { FakePushNotificationSender } from '../secondary/adapters/fake-push-notification-sender';
import { OutboxEventInMemoryRepository } from '../secondary/adapters/outbox-event-in-memory.repository';
import { PushSubscriptionInMemoryRepository } from '../secondary/adapters/push-subscription-in-memory.repository';
import {
    AUTH,
    P256DH,
    RELAY_BATCH_SIZE,
    VAPID_PUBLIC_KEY,
} from './messaging-test.push-data';
import { MessagingPromptFakes } from './messaging-test.prompts';

// The fakes and use cases of the notifications: subscriptions, the outbox relay and the push sender.
export class MessagingPushFakes extends MessagingPromptFakes {
    readonly pushSubscriptionRepository =
        new PushSubscriptionInMemoryRepository();
    readonly outboxEventRepository = new OutboxEventInMemoryRepository();
    readonly pushNotificationSender = new FakePushNotificationSender();
    readonly unitOfWork = new InMemoryUnitOfWork();

    // A subscription of a phone, as if already stored.
    givenPushSubscriptionOf(
        context: ExecutionContext,
        endpoint: string,
    ): PushSubscription {
        const subscription = PushSubscription.subscribe(
            {
                coupleId: context.coupleId,
                ownerId: context.userId,
                endpoint: PushEndpoint.create(endpoint),
                keys: PushSubscriptionKeys.create({
                    p256dh: P256DH,
                    auth: AUTH,
                }),
            },
            this.dateTimeProvider.now(),
        );
        this.pushSubscriptionRepository.seed(subscription);
        return subscription;
    }

    subscribePushNotificationsUseCase(): SubscribePushNotificationsUseCase {
        return new SubscribePushNotificationsUseCase(
            this.pushSubscriptionRepository,
            new PushSubscriptionRegistrationService(
                this.pushSubscriptionRepository,
            ),
            this.dateTimeProvider,
        );
    }

    unsubscribePushNotificationsUseCase(): UnsubscribePushNotificationsUseCase {
        return new UnsubscribePushNotificationsUseCase(
            this.pushSubscriptionRepository,
            new PushSubscriptionPreconditionService(
                this.pushSubscriptionRepository,
            ),
        );
    }

    getPushPublicKeyUseCase(): GetPushPublicKeyUseCase {
        return new GetPushPublicKeyUseCase(VAPID_PUBLIC_KEY);
    }

    relayOutboxEventsUseCase(): RelayOutboxEventsUseCase {
        return new RelayOutboxEventsUseCase(
            this.outboxEventRepository,
            new PushNotificationService(
                this.pushSubscriptionRepository,
                this.pushNotificationSender,
            ),
            this.unitOfWork,
            this.dateTimeProvider,
            RELAY_BATCH_SIZE,
        );
    }
}
