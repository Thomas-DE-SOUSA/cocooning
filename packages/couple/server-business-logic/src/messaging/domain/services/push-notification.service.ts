import { deliveriesOf, goneSubscriptionsOf } from '../models/push-delivery';
import type { OutboxEvent } from '../models/outbox-event';
import { pushNotificationsOf } from '../models/push-notification-plan';
import type { PushNotificationSender } from '../ports/push-notification-sender';
import type { PushSubscriptionRepository } from '../ports/push-subscription.repository';

export class PushNotificationService {
    constructor(
        private readonly pushSubscriptionRepository: PushSubscriptionRepository,
        private readonly pushNotificationSender: PushNotificationSender,
    ) {}

    // R10, R11: one read of the phones, one send of every delivery, one delete of the phones the push service forgot.
    async notify(events: ReadonlyArray<OutboxEvent>): Promise<void> {
        const notifications = pushNotificationsOf(events);
        if (notifications.length === 0) return;
        const coupleIds = [...new Set(notifications.map((n) => n.coupleId))];
        const subscriptions =
            await this.pushSubscriptionRepository.findOfCouples(coupleIds);
        const deliveries = deliveriesOf(notifications, subscriptions);
        if (deliveries.length === 0) return;
        const reports = await this.pushNotificationSender.sendAll(deliveries);
        const gone = goneSubscriptionsOf(reports);
        if (gone.length === 0) return;
        await this.pushSubscriptionRepository.forget(gone);
    }
}
