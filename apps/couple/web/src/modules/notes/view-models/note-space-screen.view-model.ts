import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteCardContext } from './note-card-context.view-model';
import type { NoteRowItem } from './note-card-line.view-model';
import type { NoteLocation, NotePlace } from './note-place.view-model';

export type FolderListItem = {
    readonly folderId: string;
    readonly name: string;
    readonly href: string;
    readonly folderCount: number;
    readonly noteCount: number;
    // R17: a smart folder completes what is added to it, with the « IA » badge.
    readonly isSmart: boolean;
};

export const NoteSpaceStepEnum = {
    CONTENTS: 'CONTENTS',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

// back is the place above, null above the root of a space: the home of the notes.
type ScreenPlace = {
    readonly place: NotePlace;
    readonly back: NotePlace | null;
};

// A place with the way back and its folders: a level of the screen, or of the move picker.
export type NotePlaceLevel = ScreenPlace & {
    readonly folders: readonly FolderListItem[];
};

export type NoteSpaceContentsScreen = NotePlaceLevel & {
    readonly step: typeof NoteSpaceStepEnum.CONTENTS;
    readonly notes: readonly NoteRowItem[];
    readonly cardContext: NoteCardContext | null;
    // R20: a card « en recherche » on screen; the screen reads the place again until it is filled.
    readonly hasPendingCard: boolean;
};

export type NoteSpaceScreenViewModel =
    | NoteSpaceContentsScreen
    | (ScreenPlace & {
          readonly step: typeof NoteSpaceStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      });

export type NoteSpacePage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | {
          readonly redirectTo: null;
          readonly viewModel: NoteSpaceScreenViewModel;
      };

// The address of a space screen: an unknown space or folder id is sent elsewhere.
export type NoteSpaceQuery =
    | { readonly redirectTo: string; readonly location: null }
    | { readonly redirectTo: null; readonly location: NoteLocation };
