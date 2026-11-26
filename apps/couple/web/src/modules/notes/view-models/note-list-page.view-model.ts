import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';

// A list as its page shows it; viewerId is the partner who reads it, the one whose checks say « Moi » (R29).
export type NoteListViewModel = {
    readonly noteId: string;
    readonly title: string;
    readonly emoji: string | null;
    readonly kind: NoteListKind;
    readonly isShared: boolean;
    readonly isOwner: boolean;
    readonly backHref: string;
    readonly viewerId: string;
};

export const NoteListPageStepEnum = {
    LIST: 'LIST',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type NoteListPageViewModel =
    | {
          readonly step: typeof NoteListPageStepEnum.LIST;
          readonly list: NoteListViewModel;
      }
    | {
          readonly step: typeof NoteListPageStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type NoteListPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | {
          readonly redirectTo: null;
          readonly viewModel: NoteListPageViewModel;
      };

// What the title and emoji fields hold while typed: an empty emoji is a string until the schema makes it null.
export type ListDetailsInput = {
    readonly title: string;
    readonly emoji: string;
};
