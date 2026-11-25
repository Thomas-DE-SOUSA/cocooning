import {
    type NoteSpace,
    NoteSpaceEnum,
} from '@cocooning/couple-shared-kernel/enums';
import type { NoteSpaceCounts } from '../../domain/models/note-space';

export type NoteSpaceSummaryView = {
    readonly space: NoteSpace;
    readonly folderCount: number;
    readonly noteCount: number;
};

export type NoteSpacesView = {
    readonly spaces: ReadonlyArray<NoteSpaceSummaryView>;
};

// R10: « Partagé » first, then « Privé ».
const SPACES_IN_ORDER: ReadonlyArray<NoteSpace> = [
    NoteSpaceEnum.SHARED,
    NoteSpaceEnum.PRIVATE,
];

export const toNoteSpacesView = (
    folderCounts: NoteSpaceCounts,
    noteCounts: NoteSpaceCounts,
): NoteSpacesView => ({
    spaces: SPACES_IN_ORDER.map((space) => ({
        space,
        folderCount: folderCounts[space],
        noteCount: noteCounts[space],
    })),
});
