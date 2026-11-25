import type { PushNotificationKind } from '@cocooning/couple-shared-kernel/enums';
import {
    type PushDelivery,
    type PushDeliveryOutcome,
    PushDeliveryOutcomeEnum,
    type PushDeliveryReport,
    PushNotificationSender,
} from '@cocooning/couple-server-business-logic/messaging';

export type SentPush = {
    readonly endpoint: string;
    readonly ownerId: string;
    readonly kind: PushNotificationKind;
};

// The E2E tests never call a real push service: every push is recorded, a phone answers as told by its endpoint.
export class FakePushNotificationSender extends PushNotificationSender {
    private outcomes: ReadonlyMap<string, PushDeliveryOutcome> = new Map();
    private pushes: ReadonlyArray<SentPush> = [];

    get sent(): ReadonlyArray<SentPush> {
        return this.pushes;
    }

    willAnswer(endpoint: string, outcome: PushDeliveryOutcome): void {
        this.outcomes = new Map([...this.outcomes, [endpoint, outcome]]);
    }

    reset(): void {
        this.outcomes = new Map();
        this.pushes = [];
    }

    override sendAll(
        deliveries: ReadonlyArray<PushDelivery>,
    ): Promise<ReadonlyArray<PushDeliveryReport>> {
        this.pushes = [
            ...this.pushes,
            ...deliveries.map(({ subscription, kind }) => ({
                endpoint: subscription.endpoint.value,
                ownerId: subscription.ownerId,
                kind,
            })),
        ];
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
