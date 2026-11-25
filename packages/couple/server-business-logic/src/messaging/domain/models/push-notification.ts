import type { PushNotificationKind } from '@cocooning/couple-shared-kernel/enums';
import type { PushDeliveryOutcome } from '../enums/push-delivery-outcome.enum';
import type { PushSubscription } from './push-subscription.aggregate';

// A notification of a couple: to both partners, or to the one who did not act (excludedPartnerId).
export type PushNotification = {
    readonly coupleId: string;
    readonly kind: PushNotificationKind;
    readonly excludedPartnerId: string | null;
};

// One notification to one phone; the payload is the kind alone (R10, core.md rule 33).
export type PushDelivery = {
    readonly subscription: PushSubscription;
    readonly kind: PushNotificationKind;
};

export type PushDeliveryReport = {
    readonly delivery: PushDelivery;
    readonly outcome: PushDeliveryOutcome;
};
