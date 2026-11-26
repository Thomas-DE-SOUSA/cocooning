import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NOTE_LIST_EMOJI_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';

type NoteListEmojiProps = {
    readonly value: string;
};

// Code points, as the contract counts them: a joined sequence (family, flag) stays within the bound.
const lengthOf = (value: string): number => Array.from(value).length;

export class NoteListEmoji extends ValueObject<NoteListEmojiProps> {
    private constructor(props: NoteListEmojiProps) {
        super(props);
        Object.freeze(this);
    }

    // R26: what a partner chose, trimmed, never empty, at most NOTE_LIST_EMOJI_MAX_LENGTH code points.
    static create(raw: string): NoteListEmoji {
        const value = raw.trim();
        const length = lengthOf(value);
        if (length === 0 || length > NOTE_LIST_EMOJI_MAX_LENGTH) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.NOTE_LIST_EMOJI_INVALID,
                message: 'Invalid list emoji',
                context: { min: 1, max: NOTE_LIST_EMOJI_MAX_LENGTH },
            });
        }
        return new NoteListEmoji({ value });
    }

    // R26: the emoji is optional, null without one.
    static createOptional(raw: string | null): NoteListEmoji | null {
        return raw === null ? null : NoteListEmoji.create(raw);
    }

    static from(value: string): NoteListEmoji {
        return new NoteListEmoji({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
