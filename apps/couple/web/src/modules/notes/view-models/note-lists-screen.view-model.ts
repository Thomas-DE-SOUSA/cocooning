import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteListIndexResponse } from '@cocooning/couple-contract/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import type { Result } from '@cocooning/shared-kernel/utils';

// Decision 0058: the three sections of the Lists tab; Envies has no list yet (a later lot).
export const NoteListsSectionEnum = {
    GROCERIES: 'GROCERIES',
    TASKS: 'TASKS',
    WISHES: 'WISHES',
} as const;

export type NoteListsSection =
    (typeof NoteListsSectionEnum)[keyof typeof NoteListsSectionEnum];

export type NoteListsSectionTab = {
    readonly section: NoteListsSection;
    readonly href: string;
    readonly isCurrent: boolean;
};

// R28: a list on the home of its section, with what is left to check.
export type NoteListCard = {
    readonly noteId: string;
    readonly href: string;
    readonly title: string;
    readonly emoji: string | null;
    readonly openItemCount: number;
};

export type NoteListsReading = Result<NoteListIndexResponse, ApiError> | null;

export const NoteListsStepEnum = {
    LISTS: 'LISTS',
    WISHES: 'WISHES',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type NoteListsScreenViewModel =
    | {
          readonly step: typeof NoteListsStepEnum.LISTS;
          readonly tabs: readonly NoteListsSectionTab[];
          readonly kind: NoteListKind;
          readonly shared: readonly NoteListCard[];
          readonly mine: readonly NoteListCard[];
      }
    | {
          readonly step: typeof NoteListsStepEnum.WISHES;
          readonly tabs: readonly NoteListsSectionTab[];
      }
    | {
          readonly step: typeof NoteListsStepEnum.UNAVAILABLE;
          readonly tabs: readonly NoteListsSectionTab[];
          readonly error: ApiError;
      };

export type NoteListsPage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | {
          readonly redirectTo: null;
          readonly viewModel: NoteListsScreenViewModel;
      };
