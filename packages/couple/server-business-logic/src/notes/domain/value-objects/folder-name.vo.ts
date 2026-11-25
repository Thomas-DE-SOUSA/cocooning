import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { FOLDER_NAME_MAX_LENGTH } from '@cocooning/couple-shared-kernel/limits';
import { ValueObject } from '@cocooning/shared-kernel/domain';
import { NoteException } from '../exceptions/note.exception';

type FolderNameProps = {
    readonly value: string;
};

export class FolderName extends ValueObject<FolderNameProps> {
    private constructor(props: FolderNameProps) {
        super(props);
        Object.freeze(this);
    }

    // R13: what a partner typed, trimmed, never empty, at most FOLDER_NAME_MAX_LENGTH signs.
    static create(raw: string): FolderName {
        const value = raw.trim();
        if (value.length === 0 || value.length > FOLDER_NAME_MAX_LENGTH) {
            throw new NoteException({
                code: NoteExceptionCodeEnum.FOLDER_NAME_INVALID,
                message: 'Invalid folder name',
                context: { min: 1, max: FOLDER_NAME_MAX_LENGTH },
            });
        }
        return new FolderName({ value });
    }

    static from(value: string): FolderName {
        return new FolderName({ value });
    }

    get value(): string {
        return this.props.value;
    }
}
