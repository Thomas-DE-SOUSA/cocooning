import {
    type NoteSpace,
    NoteSpaceEnum,
    type NoteVisibility,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';

// R11: « Partagé » holds the shared notes, « Privé » the private ones.
const VISIBILITY_OF_SPACE: Readonly<Record<NoteSpace, NoteVisibility>> = {
    [NoteSpaceEnum.SHARED]: NoteVisibilityEnum.SHARED,
    [NoteSpaceEnum.PRIVATE]: NoteVisibilityEnum.PRIVATE,
};

const SPACE_OF_VISIBILITY: Readonly<Record<NoteVisibility, NoteSpace>> = {
    [NoteVisibilityEnum.SHARED]: NoteSpaceEnum.SHARED,
    [NoteVisibilityEnum.PRIVATE]: NoteSpaceEnum.PRIVATE,
};

export const visibilityOfSpace = (space: NoteSpace): NoteVisibility =>
    VISIBILITY_OF_SPACE[space];

export const spaceOfVisibility = (visibility: NoteVisibility): NoteSpace =>
    SPACE_OF_VISIBILITY[visibility];

// What a partner sees in each space, for the home screen of the notes (R10).
export type NoteSpaceCounts = Readonly<Record<NoteSpace, number>>;
