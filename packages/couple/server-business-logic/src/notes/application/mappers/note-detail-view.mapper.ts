import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { NoteCard } from '../../domain/models/note-card.aggregate';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteList } from '../../domain/value-objects/note-list.vo';
import { type NoteCardView, toNoteCardView } from './note-card-view.mapper';
import { type NoteView, toNoteView } from './note-view.mapper';

// R20: a note with its card on top, null outside the smart folders.
// R26: its section and emoji when it is a list, null for an ordinary note.
export type NoteDetailView = NoteView & {
    readonly card: NoteCardView | null;
    readonly listKind: NoteListKind | null;
    readonly emoji: string | null;
};

export const toNoteDetailView = (
    note: Note,
    card: NoteCard | null,
    readerId: string,
): NoteDetailView => ({
    ...toNoteView(note, readerId),
    card: card === null ? null : toNoteCardView(card),
    ...NoteList.snapshotOf(note.list),
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
