import type { NoteCardStatus } from '@cocooning/couple-shared-kernel/enums';
import type { NoteCardChoice } from './note-card-choice.view-model';

// R21, R22: a field of the card; a null value is « Non trouvé », isManual marks a value corrected by hand.
export type NoteCardField = {
    readonly name: string;
    readonly value: string | null;
    readonly isManual: boolean;
};

// R21, decision 0055: a link of the card; the page of a place on OpenStreetMap is named, as its licence asks.
export type NoteCardSource = {
    readonly url: string;
    readonly isOpenStreetMap: boolean;
};

// The card at the top of the page of a note (R20 to R22, R25). choice is set while the card waits for a candidate;
// searchedOn is the day of the search in Paris; canRefresh is false outside a smart folder (R25).
export type NoteCardViewModel = {
    readonly noteId: string;
    readonly status: NoteCardStatus;
    readonly fields: readonly NoteCardField[];
    readonly choice: NoteCardChoice | null;
    readonly sources: readonly NoteCardSource[];
    readonly searchedOn: string | null;
    readonly canRefresh: boolean;
};
