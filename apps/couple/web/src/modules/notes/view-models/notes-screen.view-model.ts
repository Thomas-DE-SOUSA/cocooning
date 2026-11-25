import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type {
    NotePageResponse,
    NoteSpacesResponse,
} from '@cocooning/couple-contract/notes';
import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';

export type NoteListItem = {
    readonly noteId: string;
    readonly href: string;
    readonly title: string;
    readonly isShared: boolean;
    readonly isOwner: boolean;
    readonly updatedAt: string;
};

// R10: a space of the home with what the partner sees in it.
export type NoteSpaceCard = {
    readonly space: NoteSpace;
    readonly href: string;
    readonly folderCount: number;
    readonly noteCount: number;
};

// What the home reads: the two spaces, and the notes changed last.
export type NotesHomeReading = {
    readonly spaces: Result<NoteSpacesResponse, ApiError>;
    readonly recentNotes: Result<NotePageResponse, ApiError>;
};

export const NotesStepEnum = {
    HOME: 'HOME',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type NotesScreenViewModel =
    | {
          readonly step: typeof NotesStepEnum.HOME;
          readonly spaces: readonly NoteSpaceCard[];
          readonly recentNotes: readonly NoteListItem[];
      }
    | {
          readonly step: typeof NotesStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type NotesPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | { readonly redirectTo: null; readonly viewModel: NotesScreenViewModel };
