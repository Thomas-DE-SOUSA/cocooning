import type { ApiError } from '@cocooning/couple-client-business-logic/shared';
import type { NoteListItem } from './notes-screen.view-model';

export const NotePageStepEnum = {
    NOTE: 'NOTE',
    UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type NotePageViewModel =
    | {
          readonly step: typeof NotePageStepEnum.NOTE;
          readonly note: NoteListItem;
      }
    | {
          readonly step: typeof NotePageStepEnum.UNAVAILABLE;
          readonly error: ApiError;
      };

export type NotePage =
    | { readonly redirectTo: string; readonly viewModel: null }
    | { readonly redirectTo: null; readonly viewModel: NotePageViewModel };
