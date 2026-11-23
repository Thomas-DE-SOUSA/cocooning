import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NOTE_TITLE_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';

type NoteTitleProps = {
    readonly value: string;
};

export class NoteTitle extends ValueObject<NoteTitleProps> {
    private constructor(props: NoteTitleProps) {
        super(props);
        Object.freeze(this);
    }

    // R8: what a partner typed, trimmed, never empty, at most NOTE_TITLE_MAX_LENGTH signs.
    static create(raw: string): NoteTitle {
        const value = raw.trim();
        if (value.length === 0 || value.length > NOTE_TITLE_MAX_LENGTH) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
                message: 'Invalid note title',
                context: { min: 1, max: NOTE_TITLE_MAX_LENGTH },
            });
        }
        return new NoteTitle({ value });
    }

    static from(value: string): NoteTitle {
        return new NoteTitle({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
