import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NOTE_CARD_QUERY_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';

type NoteCardQueryProps = {
    readonly value: string;
};

// R19: what the couple typed, the name of the item or « je précise », searched with the context of the folder.
export class NoteCardQuery extends ValueObject<NoteCardQueryProps> {
    private constructor(props: NoteCardQueryProps) {
        super(props);
        Object.freeze(this);
    }

    static create(raw: string): NoteCardQuery {
        const value = raw.trim();
        if (value.length === 0 || value.length > NOTE_CARD_QUERY_MAX_LENGTH) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.NOTE_CARD_QUERY_INVALID,
                message: 'Invalid note card query',
                context: { min: 1, max: NOTE_CARD_QUERY_MAX_LENGTH },
            });
        }
        return new NoteCardQuery({ value });
    }

    // R19: the chosen candidate becomes the query, cut to the bound since the AI wrote it.
    static ofCandidate(label: string, detail: string): NoteCardQuery {
        const value = [label, detail]
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .join(', ');
        return new NoteCardQuery({
            value: value.slice(0, NOTE_CARD_QUERY_MAX_LENGTH),
        });
    }

    static from(value: string): NoteCardQuery {
        return new NoteCardQuery({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
