import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';
import type { NoteList } from '../value-objects/note-list.vo';

export class NoteListValidator {
    // R26: a route of the lists only acts on a list; an ordinary note is not one.
    static ensureList(list: NoteList | null): NoteList {
        if (list !== null) return list;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_LIST_NOT_FOUND,
            message: 'The note is not a list',
        });
    }

    // R27: a list lives in the Lists tab, at the root of its space, never in a folder.
    static ensureMovable(list: NoteList | null): void {
        if (list === null) return;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_LIST_NOT_MOVABLE,
            message: 'A list is never moved into a folder',
        });
    }
}
