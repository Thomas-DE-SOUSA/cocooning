import type { ApiError } from '@cocooning/couple-client-business-logic/shared';

export type NoteListItem = {
    readonly noteId: string;
    readonly title: string;
    readonly isShared: boolean;
    readonly isOwner: boolean;
    readonly updatedAt: string;
};

export const NotesStepEnum = {
    LIST: 'LIST',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type NotesScreenViewModel =
    | {
          readonly step: typeof NotesStepEnum.LIST;
          readonly notes: readonly NoteListItem[];
      }
    | {
          readonly step: typeof NotesStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type NotesPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | { readonly redirectTo: null; readonly viewModel: NotesScreenViewModel };
