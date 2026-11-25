import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import type { NoteListItem } from './notes-screen.view-model';

// R20, R21: what a row tells of a card: its status, and once filled its first values found.
export type NoteCardLine = {
    readonly status: NoteCardStatus;
    readonly summary: string | null;
};

// A note of a place, with the line of its card when it has one (R20).
export type NoteRowItem = NoteListItem & {
    readonly card: NoteCardLine | null;
};
