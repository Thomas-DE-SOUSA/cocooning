import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';
import type { NoteCard } from '../models/note-card.aggregate';
import type { Note } from '../models/note.aggregate';
import type { NoteCardRepository } from '../ports/note-card.repository';

export class NoteCardPreconditionService {
    constructor(private readonly noteCardRepository: NoteCardRepository) {}

    // R20: the card of a note the partner sees; a note outside the smart folders has none.
    async loadCardOf(note: Note): Promise<NoteCard> {
        const card = await this.noteCardRepository.findByNoteId(
            note.coupleId,
            note.id.getValue(),
        );
        if (card !== null) return card;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_CARD_NOT_FOUND,
            message: 'This note has no card',
        });
    }
}
