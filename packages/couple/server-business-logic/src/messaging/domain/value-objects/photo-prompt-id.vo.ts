import { Uuid } from '@cocooning/shared-kernel/domain';

export class PhotoPromptId extends Uuid {
    static generate(): PhotoPromptId {
        return new PhotoPromptId(Uuid.generateValue());
    }

    static from(value: string): PhotoPromptId {
        return new PhotoPromptId(value);
    }
}
