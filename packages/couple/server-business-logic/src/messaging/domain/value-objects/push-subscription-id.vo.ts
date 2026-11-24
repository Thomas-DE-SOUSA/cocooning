import { Uuid } from '@cocooning/shared-kernel/domain';

export class PushSubscriptionId extends Uuid {
    static generate(): PushSubscriptionId {
        return new PushSubscriptionId(Uuid.generateValue());
    }

    static from(value: string): PushSubscriptionId {
        return new PushSubscriptionId(value);
    }
}
