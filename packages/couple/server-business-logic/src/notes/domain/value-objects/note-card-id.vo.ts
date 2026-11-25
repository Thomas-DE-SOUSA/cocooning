import { Uuid } from '@cocooning/shared-kernel/domain';

export class NoteCardId extends Uuid {
    static generate(): NoteCardId {
        return new NoteCardId(Uuid.generateValue());
    }

    static from(value: string): NoteCardId {
        return new NoteCardId(value);
    }
}
