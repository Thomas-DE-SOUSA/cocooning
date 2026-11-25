import type { NoteCard } from '../models/note-card.aggregate';

// A card is read through its note, already loaded as visible (R4): the repository filters by couple only.
export abstract class NoteCardRepository {
    abstract save(card: NoteCard): Promise<void>;
    // Several cards in one transaction, their events with them (R22).
    abstract saveAll(cards: ReadonlyArray<NoteCard>): Promise<void>;
    abstract findByNoteId(
        coupleId: string,
        noteId: string,
    ): Promise<NoteCard | null>;
    // The cards of the notes given, in one query.
    abstract findByNoteIds(
        coupleId: string,
        noteIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<NoteCard>>;
    // R18, R22: the cards of the live notes of a folder and of all its sub-folders, in one query.
    abstract findInTree(
        coupleId: string,
        folderId: string,
    ): Promise<ReadonlyArray<NoteCard>>;
    // Decision 0054: the background task reserves a few cards « en recherche », of every couple, oldest request first;
    // a card reserved and not saved again is offered anew once its reservation is over (at least once).
    abstract claimPending(
        limit: number,
        now: Date,
    ): Promise<ReadonlyArray<NoteCard>>;
}
