import type { MovedItem } from './moved-item.view-model';
import type { NotePlace } from './note-place.view-model';
import type {
    FolderListItem,
    NotePlaceLevel,
} from './note-space-screen.view-model';
import type { NoteListItem } from './notes-screen.view-model';

export const NoteSheetKindEnum = {
    NEW_NOTE: 'NEW_NOTE',
    NEW_FOLDER: 'NEW_FOLDER',
    FOLDER: 'FOLDER',
    NOTE: 'NOTE',
    MOVE: 'MOVE',
} as const;

// What the bottom sheet of the notes shows: a creation in the place of the screen (R13), the actions on a folder or a
// note of a level, or the move picker, which starts from that level.
export type NoteSheetTarget =
    | {
          readonly kind:
              | typeof NoteSheetKindEnum.NEW_NOTE
              | typeof NoteSheetKindEnum.NEW_FOLDER;
          readonly place: NotePlace;
      }
    | {
          readonly kind: typeof NoteSheetKindEnum.FOLDER;
          readonly folder: FolderListItem;
          readonly level: NotePlaceLevel;
      }
    | {
          readonly kind: typeof NoteSheetKindEnum.NOTE;
          readonly note: NoteListItem;
          readonly level: NotePlaceLevel;
      }
    | {
          readonly kind: typeof NoteSheetKindEnum.MOVE;
          readonly item: MovedItem;
          readonly level: NotePlaceLevel;
      };

export const FolderSheetStepEnum = {
    ACTIONS: 'ACTIONS',
    RENAME: 'RENAME',
    DELETE: 'DELETE',
} as const;

export type FolderSheetStep =
    (typeof FolderSheetStepEnum)[keyof typeof FolderSheetStepEnum];

// The words of a folder name sheet, translated by its container: a new folder or a renamed one.
export type FolderNameSheetLabels = {
    readonly title: string;
    readonly description: string;
    readonly submit: string;
    readonly pending: string;
};
