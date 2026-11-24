import type { TodayPhotoPromptResponse } from '@cocooning/couple-contract/messaging';
import {
    type PhotoPromptCard,
    PhotoPromptCardStatusEnum,
} from '../view-models/photo-prompt-card.view-model';
import { presentParisTime } from './paris-time.presenter';

const MINUTE_MS = 60_000;

// R7, R8: no card before the prompt is issued nor after midnight; the minutes left are counted when the page is read.
export function presentPhotoPromptCard(
    { photoPrompt }: TodayPhotoPromptResponse,
    now: Date,
): PhotoPromptCard | null {
    if (photoPrompt === null) return null;
    if (photoPrompt.myInstantPhotoId !== null) {
        return {
            status: PhotoPromptCardStatusEnum.ANSWERED,
            isAnsweredByPartner: photoPrompt.isAnsweredByPartner,
        };
    }
    if (now.getTime() >= Date.parse(photoPrompt.closesAt)) return null;
    const msBeforeLate = Date.parse(photoPrompt.lateFrom) - now.getTime();
    return {
        status: PhotoPromptCardStatusEnum.OPEN,
        photoPromptId: photoPrompt.id,
        issuedAt: presentParisTime(photoPrompt.issuedAt),
        minutesBeforeLate:
            msBeforeLate > 0 ? Math.ceil(msBeforeLate / MINUTE_MS) : null,
        isAnsweredByPartner: photoPrompt.isAnsweredByPartner,
    };
}
