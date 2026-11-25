import type {
    PushDelivery,
    PushDeliveryReport,
} from '../models/push-notification';

export abstract class PushNotificationSender {
    // One attempt per delivery, sent together; never throws for a refusal: GONE (404, 410) or FAILED, in delivery order.
    abstract sendAll(
        deliveries: ReadonlyArray<PushDelivery>,
    ): Promise<ReadonlyArray<PushDeliveryReport>>;
}
