import { Uuid } from '@cocooning/shared-kernel/domain';

export class NoteId extends Uuid {
    static generate(): NoteId {
        return new NoteId(Uuid.generateValue());
    }

    static from(value: string): NoteId {
        return new NoteId(value);
    }
}
