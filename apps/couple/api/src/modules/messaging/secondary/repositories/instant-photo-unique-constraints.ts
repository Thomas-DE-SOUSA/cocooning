import { violatedUniqueConstraint } from '@cocooning/couple-prisma/errors';
import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingException } from '@cocooning/couple-server-business-logic/messaging';

// R8: the partial index of the migration keeps one live photo of the day per partner and per prompt.
const PHOTO_OF_THE_DAY_CONSTRAINT =
    'instant_photo_couple_id_photo_prompt_id_owner_id_key';

export const toPhotoPromptAlreadyAnswered = (
    error: unknown,
): MessagingException | null =>
    violatedUniqueConstraint(error) === PHOTO_OF_THE_DAY_CONSTRAINT
        ? new MessagingException({
              code: MessagingExceptionCodeEnum.PHOTO_PROMPT_ALREADY_ANSWERED,
              message: 'Photo of the day already sent',
          })
        : null;
