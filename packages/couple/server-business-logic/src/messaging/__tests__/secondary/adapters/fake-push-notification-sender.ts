import type { PushNotificationKind } from '@cocooning/couple-shared-kernel/enums';
import {
    type PushDeliveryOutcome,
    PushDeliveryOutcomeEnum,
} from '../../../domain/enums/push-delivery-outcome.enum';
import type {
    PushDelivery,
    PushDeliveryReport,
} from '../../../domain/models/push-notification';
import { PushNotificationSender } from '../../../domain/ports/push-notification-sender';

export type SentPush = {
    readonly endpoint: string;
    readonly ownerId: string;
    readonly kind: PushNotificationKind;
};

const toSentPush = ({ subscription, kind }: PushDelivery): SentPush => ({
    endpoint: subscription.endpoint.value,
    ownerId: subscription.ownerId,
    kind,
});

// Records every push; a phone answers DELIVERED unless told otherwise by its endpoint.
export class FakePushNotificationSender extends PushNotificationSender {
    private outcomes: ReadonlyMap<string, PushDeliveryOutcome> = new Map();
    private pushes: ReadonlyArray<SentPush> = [];
    private failure: Error | null = null;

    get sent(): ReadonlyArray<SentPush> {
        return this.pushes;
    }

    willAnswer(endpoint: string, outcome: PushDeliveryOutcome): void {
        this.outcomes = new Map([...this.outcomes, [endpoint, outcome]]);
    }

    failWith(error: Error): void {
        this.failure = error;
    }

    override sendAll(
        deliveries: ReadonlyArray<PushDelivery>,
    ): Promise<ReadonlyArray<PushDeliveryReport>> {
        if (this.failure !== null) return Promise.reject(this.failure);
        this.pushes = [...this.pushes, ...deliveries.map(toSentPush)];
        return Promise.resolve(
            deliveries.map((delivery) => ({
                delivery,
                outcome:
                    this.outcomes.get(delivery.subscription.endpoint.value) ??
                    PushDeliveryOutcomeEnum.DELIVERED,
            })),
        );
    }
}
