import { Uuid } from '@cocooning/shared-kernel/domain';

export class CoupleId extends Uuid {
    static generate(): CoupleId {
        return new CoupleId(Uuid.generateValue());
    }

    static from(value: string): CoupleId {
        return new CoupleId(value);
    }
}
