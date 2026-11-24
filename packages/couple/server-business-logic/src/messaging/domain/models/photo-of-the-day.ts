import type { InstantPhoto } from './instant-photo.aggregate';
import type { PhotoPrompt } from './photo-prompt.aggregate';

// R8: what answering a photo prompt gives the photo of the day.
export type PhotoPromptAnswer = {
    readonly photoPromptId: string;
    readonly isLate: boolean;
};

// R7 to R9: the issued prompt of the day and the live photos that answer it, one per partner at most.
export type PhotoPromptOfTheDay = {
    readonly photoPrompt: PhotoPrompt;
    readonly issuedAt: Date;
    readonly photosOfTheDay: ReadonlyArray<InstantPhoto>;
};

// The photo prompts a partner answered: the partner's photo of those days is visible to them (R9).
export type AnsweredPhotoPrompts = ReadonlySet<string | null>;

export const NO_PHOTO_PROMPT_ANSWERED: AnsweredPhotoPrompts = new Set();

// Among photos of the day already read, those a partner sent.
export const photoPromptsAnsweredBy = (
    userId: string,
    photosOfTheDay: ReadonlyArray<InstantPhoto>,
): AnsweredPhotoPrompts =>
    new Set(
        photosOfTheDay
            .filter((photo) => photo.ownerId === userId)
            .map((photo) => photo.photoPromptId),
    );

// R9: the partner's photo of the day stays hidden from a reader who has not answered its prompt; a spontaneous photo never.
export const isHiddenFrom = (
    instantPhoto: InstantPhoto,
    readerId: string,
    answered: AnsweredPhotoPrompts,
): boolean =>
    instantPhoto.photoPromptId !== null &&
    instantPhoto.ownerId !== readerId &&
    !answered.has(instantPhoto.photoPromptId);
