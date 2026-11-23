import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';

export class NoteAccessValidator {
    // R5, R7: the other partner sees a shared note, so the refusal may say why.
    static ensureOwner(ownerId: string, userId: string): void {
        if (ownerId === userId) return;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
            message: 'Reserved to the owner of the note',
        });
    }
}
