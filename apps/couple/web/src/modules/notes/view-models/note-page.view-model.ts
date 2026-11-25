import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type {
    NoteResponse,
    NoteSpaceContentsResponse,
} from '@cocooning/couple-contract/notes';
import type { NotePlaceLevel } from './note-space-screen.view-model';
import type { NoteListItem } from './notes-screen.view-model';

// What the page of a note reads: the note, and the contents of the place it is in.
export type NoteReading = {
    readonly note: NoteResponse;
    readonly place: NoteSpaceContentsResponse;
};

export const NotePageStepEnum = {
    NOTE: 'NOTE',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

// level.place is where the note is: the way back of the page, and the first level of the move picker.
export type NotePageViewModel =
    | {
          readonly step: typeof NotePageStepEnum.NOTE;
          readonly note: NoteListItem;
          readonly level: NotePlaceLevel;
      }
    | {
          readonly step: typeof NotePageStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type NotePage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | { readonly redirectTo: null; readonly viewModel: NotePageViewModel };
