import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteException } from '../exceptions/note.exception';
import type { CardCandidate } from '../models/note-card.aggregate.type';

export class NoteCardCandidateValidator {
    // R19: only a candidate the card shows can be chosen.
    static candidateAt(
        candidates: ReadonlyArray<CardCandidate>,
        index: number,
    ): CardCandidate {
        const candidate = candidates[index];
        if (candidate !== undefined) return candidate;
        throw new NoteException({
            code: NoteExceptionCodeEnum.NOTE_CARD_CANDIDATE_INVALID,
            message: 'No such candidate',
            context: { max: candidates.length - 1 },
        });
    }
}
