import type { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    GetPushPublicKeyUseCase,
    OutboxEventRepository,
    PushNotificationSender,
    PushNotificationService,
    PushSubscriptionPreconditionService,
    PushSubscriptionRegistrationService,
    PushSubscriptionRepository,
    RelayOutboxEventsUseCase,
    SubscribePushNotificationsUseCase,
    UnsubscribePushNotificationsUseCase,
} from '@cocooning/couple-server-business-logic/messaging';
import { DateTimeProvider, UnitOfWork } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../env';

// R10: the oldest events of the three outboxes one relay tick handles; the rest waits for the next tick.
export const OUTBOX_RELAY_BATCH_SIZE = 50;

// The use cases of the notifications; domain services are created inline (decision 0005).
export const pushUseCases: ReadonlyArray<FactoryProvider> = [
    {
        provide: SubscribePushNotificationsUseCase,
        inject: [PushSubscriptionRepository, DateTimeProvider],
        useFactory: (
            subscriptions: PushSubscriptionRepository,
            clock: DateTimeProvider,
        ) =>
            new SubscribePushNotificationsUseCase(
                subscriptions,
                new PushSubscriptionRegistrationService(subscriptions),
                clock,
            ),
    },
    {
        provide: UnsubscribePushNotificationsUseCase,
        inject: [PushSubscriptionRepository],
        useFactory: (subscriptions: PushSubscriptionRepository) =>
            new UnsubscribePushNotificationsUseCase(
                subscriptions,
                new PushSubscriptionPreconditionService(subscriptions),
            ),
    },
    {
        provide: GetPushPublicKeyUseCase,
        inject: [ConfigService],
        useFactory: (config: ConfigService<Environment, true>) =>
            new GetPushPublicKeyUseCase(
                config.getOrThrow('WEB_PUSH_VAPID_PUBLIC_KEY', { infer: true }),
            ),
    },
    {
        provide: RelayOutboxEventsUseCase,
        inject: [
            OutboxEventRepository,
            PushSubscriptionRepository,
            PushNotificationSender,
            UnitOfWork,
            DateTimeProvider,
        ],
        useFactory: (
            outbox: OutboxEventRepository,
            subscriptions: PushSubscriptionRepository,
            sender: PushNotificationSender,
            unitOfWork: UnitOfWork,
            clock: DateTimeProvider,
        ) =>
            new RelayOutboxEventsUseCase(
                outbox,
                new PushNotificationService(subscriptions, sender),
                unitOfWork,
                clock,
                OUTBOX_RELAY_BATCH_SIZE,
            ),
    },
];
