import { Uuid } from '@cocooning/shared-kernel/domain';

export class AccountId extends Uuid {
    static generate(): AccountId {
        return new AccountId(Uuid.generateValue());
    }

    static from(value: string): AccountId {
        return new AccountId(value);
    }
}
