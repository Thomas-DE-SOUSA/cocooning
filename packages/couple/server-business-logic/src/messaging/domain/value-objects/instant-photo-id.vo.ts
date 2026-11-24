import { Uuid } from '@cocooning/shared-kernel/domain';

export class InstantPhotoId extends Uuid {
    static generate(): InstantPhotoId {
        return new InstantPhotoId(Uuid.generateValue());
    }

    static from(value: string): InstantPhotoId {
        return new InstantPhotoId(value);
    }
}
