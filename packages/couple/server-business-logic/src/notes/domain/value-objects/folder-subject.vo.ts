import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FOLDER_SUBJECT_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';

type FolderSubjectProps = {
    readonly value: string;
};

export class FolderSubject extends ValueObject<FolderSubjectProps> {
    private constructor(props: FolderSubjectProps) {
        super(props);
        Object.freeze(this);
    }

    // R17: one sentence, trimmed, never empty, at most FOLDER_SUBJECT_MAX_LENGTH signs.
    static create(raw: string): FolderSubject {
        const value = raw.trim();
        if (value.length === 0 || value.length > FOLDER_SUBJECT_MAX_LENGTH) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.FOLDER_SUBJECT_INVALID,
                message: 'Invalid folder subject',
                context: { min: 1, max: FOLDER_SUBJECT_MAX_LENGTH },
            });
        }
        return new FolderSubject({ value });
    }

    static from(value: string): FolderSubject {
        return new FolderSubject({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
