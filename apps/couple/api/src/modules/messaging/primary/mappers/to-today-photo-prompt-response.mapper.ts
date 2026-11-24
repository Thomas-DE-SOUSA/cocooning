import type { TodayPhotoPromptResponse } from '@cocooning/couple-contract/messaging';
import type { TodayPhotoPromptView } from '@cocooning/couple-server-business-logic/messaging';

// Dates cross the wire as ISO strings (contracts.md rule 4).
export const toTodayPhotoPromptResponse = ({
    photoPrompt,
}: TodayPhotoPromptView): TodayPhotoPromptResponse => ({
    photoPrompt:
        photoPrompt === null
            ? null
            : {
                  ...photoPrompt,
                  issuedAt: photoPrompt.issuedAt.toISOString(),
                  lateFrom: photoPrompt.lateFrom.toISOString(),
                  closesAt: photoPrompt.closesAt.toISOString(),
              },
});
