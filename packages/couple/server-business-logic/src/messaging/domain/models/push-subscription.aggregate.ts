import { AggregateRoot, EntityMetadata } from '@cocooning/shared-kernel/domain';
import { PushEndpoint } from '../value-objects/push-endpoint.vo';
import { PushSubscriptionId } from '../value-objects/push-subscription-id.vo';
import { PushSubscriptionKeys } from '../value-objects/push-subscription-keys.vo';
import type {
    PushSubscriptionProps,
    PushSubscriptionSnapshot,
    SubscribePushInput,
} from './push-subscription.aggregate.type';

const INITIAL_VERSION = 1;

// No domain event: nothing reacts to a subscription, and its endpoint and keys are secrets of the phone.
export class PushSubscription extends AggregateRoot {
    private constructor(private readonly props: PushSubscriptionProps) {
        super();
    }

    // R11: a phone of a partner allows the notifications.
    static subscribe(input: SubscribePushInput, now: Date): PushSubscription {
        return new PushSubscription({
            ...input,
            id: PushSubscriptionId.generate(),
            version: INITIAL_VERSION,
            metadata: EntityMetadata.create(now),
        });
    }

    static fromSnapshot(snapshot: PushSubscriptionSnapshot): PushSubscription {
        const { p256dh, auth } = snapshot;
        return new PushSubscription({
            id: PushSubscriptionId.from(snapshot.id),
            coupleId: snapshot.coupleId,
            ownerId: snapshot.ownerId,
            endpoint: PushEndpoint.from(snapshot.endpoint),
            keys: PushSubscriptionKeys.from({ p256dh, auth }),
            version: snapshot.version,
            metadata: EntityMetadata.fromSnapshot(snapshot.metadata),
        });
    }

    // R11: the same phone subscribing again renews its keys and follows the partner signed in on it.
    renewFor(ownerId: string, keys: PushSubscriptionKeys, now: Date): void {
        this.props.ownerId = ownerId;
        this.props.keys = keys;
        this.props.metadata = this.props.metadata.recordUpdate(now);
    }

    get id(): PushSubscriptionId {
        return this.props.id;
    }

    get coupleId(): string {
        return this.props.coupleId;
    }

    get ownerId(): string {
        return this.props.ownerId;
    }

    get endpoint(): PushEndpoint {
        return this.props.endpoint;
    }

    get keys(): PushSubscriptionKeys {
        return this.props.keys;
    }

    toSnapshot(): PushSubscriptionSnapshot {
        const { id, coupleId, ownerId, endpoint, keys, version, metadata } =
            this.props;
        return {
            id: id.getValue(),
            coupleId,
            ownerId,
            endpoint: endpoint.value,
            p256dh: keys.p256dh,
            auth: keys.auth,
            version,
            metadata: metadata.toSnapshot(),
        };
    }
}
