import type {
    EntityMetadata,
    EntityMetadataSnapshot,
} from '@cocooning/shared-kernel/domain';
import type { PushEndpoint } from '../value-objects/push-endpoint.vo';
import type { PushSubscriptionId } from '../value-objects/push-subscription-id.vo';
import type { PushSubscriptionKeys } from '../value-objects/push-subscription-keys.vo';

export type PushSubscriptionProps = {
    readonly id: PushSubscriptionId;
    readonly coupleId: string;
    ownerId: string;
    readonly endpoint: PushEndpoint;
    keys: PushSubscriptionKeys;
    readonly version: number;
    metadata: EntityMetadata;
};

export type SubscribePushInput = {
    readonly coupleId: string;
    readonly ownerId: string;
    readonly endpoint: PushEndpoint;
    readonly keys: PushSubscriptionKeys;
};

export type PushSubscriptionSnapshot = {
    readonly id: string;
    readonly coupleId: string;
    readonly ownerId: string;
    readonly endpoint: string;
    readonly p256dh: string;
    readonly auth: string;
    readonly version: number;
    readonly metadata: EntityMetadataSnapshot;
};
