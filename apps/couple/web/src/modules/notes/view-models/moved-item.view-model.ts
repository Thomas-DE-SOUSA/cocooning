import type { NoteSpace } from '@cocooning/couple-shared-kernel/enums';
import type { NoteLocation } from './note-place.view-model';

export const MovedItemKindEnum = {
    NOTE: 'NOTE',
    FOLDER: 'FOLDER',
} as const;

// What the move picker moves: a note or a folder, where it is now, and the spaces it may go to (R11, R15).
export type MovedItem = {
    readonly kind: (typeof MovedItemKindEnum)[keyof typeof MovedItemKindEnum];
    readonly id: string;
    readonly name: string;
    readonly from: NoteLocation;
    readonly spaces: readonly NoteSpace[];
};
