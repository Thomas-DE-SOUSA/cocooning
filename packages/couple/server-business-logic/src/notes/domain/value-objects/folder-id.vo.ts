import { Uuid } from '@cocooning/shared-kernel/domain';

export class FolderId extends Uuid {
    static generate(): FolderId {
        return new FolderId(Uuid.generateValue());
    }

    static from(value: string): FolderId {
        return new FolderId(value);
    }
}
