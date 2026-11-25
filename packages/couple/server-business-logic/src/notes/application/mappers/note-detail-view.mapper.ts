import type { NoteCard } from '../../domain/models/note-card.aggregate';
import type { Note } from '../../domain/models/note.aggregate';
import { type NoteCardView, toNoteCardView } from './note-card-view.mapper';
import { type NoteView, toNoteView } from './note-view.mapper';

// R20: a note with its card on top, null outside the smart folders.
export type NoteDetailView = NoteView & {
    readonly card: NoteCardView | null;
};

export const toNoteDetailView = (
    note: Note,
    card: NoteCard | null,
    readerId: string,
): NoteDetailView => ({
    ...toNoteView(note, readerId),
    card: card === null ? null : toNoteCardView(card),
});

// The cards of a list of notes, matched by note in memory after one grouped read.
export const toNoteDetailViews = (
    notes: ReadonlyArray<Note>,
    cards: ReadonlyArray<NoteCard>,
    readerId: string,
): ReadonlyArray<NoteDetailView> =>
    notes.map((note) =>
        toNoteDetailView(
            note,
            cards.find((card) => card.noteId === note.id.getValue()) ?? null,
            readerId,
        ),
    );
