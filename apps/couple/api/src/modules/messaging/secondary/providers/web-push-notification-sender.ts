import { Injectable } from '@nestjs/common';
import {
    type PushDelivery,
    type PushDeliveryReport,
    PushDeliveryOutcomeEnum,
    PushNotificationSender,
    type PushSubscription,
} from '@cocooning/couple-server-business-logic/messaging';
import { Logger } from '@cocooning/shared-kernel/ports';
import { type RequestOptions, sendNotification } from 'web-push';
import {
    pushDeliveryOutcomeOf,
    statusCodeOf,
} from './push-delivery-outcome-of';

// A notification older than this is no longer news: the push service drops it (R10).
export const PUSH_NOTIFICATION_TTL_SECONDS = 12 * 60 * 60;
// A person, not a background sync: the push service wakes the phone.
export const PUSH_NOTIFICATION_URGENCY = 'high';
// Bounds the socket of each request, so a batch ends well within the relay's transaction (DB_TX_TIMEOUT_MS).
export const PUSH_REQUEST_TIMEOUT_MS = 2_000;

export type VapidDetails = {
    readonly subject: string;
    readonly publicKey: string;
    readonly privateKey: string;
};

const toWebPushSubscription = (subscription: PushSubscription) => ({
    endpoint: subscription.endpoint.value,
    keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
});

// Web Push (RFC 8030, 8291, 8292) with the web-push package; the payload is the kind alone (core.md rule 33).
@Injectable()
export class WebPushNotificationSender extends PushNotificationSender {
    private readonly options: RequestOptions;

    constructor(
        vapidDetails: VapidDetails,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(WebPushNotificationSender.name);
        this.options = {
            vapidDetails: { ...vapidDetails },
            TTL: PUSH_NOTIFICATION_TTL_SECONDS,
            urgency: PUSH_NOTIFICATION_URGENCY,
            timeout: PUSH_REQUEST_TIMEOUT_MS,
            contentEncoding: 'aes128gcm',
        };
    }

    override sendAll(
        deliveries: ReadonlyArray<PushDelivery>,
    ): Promise<ReadonlyArray<PushDeliveryReport>> {
        return Promise.all(deliveries.map((delivery) => this.send(delivery)));
    }

    // The topic lets the push service replace a waiting notification of the same kind with the newer one.
    private async send(delivery: PushDelivery): Promise<PushDeliveryReport> {
        const { subscription, kind } = delivery;
        try {
            await sendNotification(
                toWebPushSubscription(subscription),
                JSON.stringify({ kind }),
                { ...this.options, topic: kind },
            );
            return { delivery, outcome: PushDeliveryOutcomeEnum.DELIVERED };
        } catch (error) {
            const outcome = pushDeliveryOutcomeOf(error);
            // Never the error itself: it carries the endpoint, a secret of the phone (core.md rule 30).
            this.logger.warn('Push notification not delivered', {
                pushSubscriptionId: subscription.id.getValue(),
                kind,
                outcome,
                statusCode: statusCodeOf(error),
            });
            return { delivery, outcome };
        }
    }
}
