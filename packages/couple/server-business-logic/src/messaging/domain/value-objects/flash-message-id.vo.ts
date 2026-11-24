import { Uuid } from '@cocooning/shared-kernel/domain';

export class FlashMessageId extends Uuid {
    static generate(): FlashMessageId {
        return new FlashMessageId(Uuid.generateValue());
    }

    static from(value: string): FlashMessageId {
        return new FlashMessageId(value);
    }
}
