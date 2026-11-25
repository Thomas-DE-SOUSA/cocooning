import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import { NoteException } from '../exceptions/note.exception';

export class NoteCardStatusValidator {
    // R19 to R22: each action of a card waits for a status; a search in progress takes no other.
    static ensureIn(
        status: NoteCardStatus,
        allowed: ReadonlyArray<NoteCardStatus>,
    ): void {
        if (allowed.includes(status)) return;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_CARD_STATUS_INVALID,
            message: 'The card cannot do this in its status',
            context: { status },
        });
    }
}
