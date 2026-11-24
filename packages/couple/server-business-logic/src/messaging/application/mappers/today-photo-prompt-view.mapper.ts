import type { PhotoPromptOfTheDay } from '../../domain/models/photo-of-the-day';
import { photoPromptLateFrom } from '../../domain/value-objects/photo-prompt-schedule';

export type PhotoPromptView = {
    readonly id: string;
    readonly issuedAt: Date;
    readonly lateFrom: Date;
    readonly closesAt: Date;
    readonly myInstantPhotoId: string | null;
    readonly isAnsweredByPartner: boolean;
};

// R7, R8: null until the prompt of the day is issued; then when it turns late and closes, and who answered.
export type TodayPhotoPromptView = {
    readonly photoPrompt: PhotoPromptView | null;
};

const toPhotoPromptView = (
    { photoPrompt, issuedAt, photosOfTheDay }: PhotoPromptOfTheDay,
    readerId: string,
): PhotoPromptView => {
    const mine = photosOfTheDay.find(({ ownerId }) => ownerId === readerId);
    return {
        id: photoPrompt.id.getValue(),
        issuedAt,
        lateFrom: photoPromptLateFrom(issuedAt),
        closesAt: photoPrompt.closesAt,
        myInstantPhotoId: mine === undefined ? null : mine.id.getValue(),
        isAnsweredByPartner: photosOfTheDay.some(
            ({ ownerId }) => ownerId !== readerId,
        ),
    };
};

export const toTodayPhotoPromptView = (
    today: PhotoPromptOfTheDay | null,
    readerId: string,
): TodayPhotoPromptView => ({
    photoPrompt: today === null ? null : toPhotoPromptView(today, readerId),
});
