import { MessagingExceptionCodeEnum } from '@cocooning/couple-contract/messaging';
import { MessagingException } from '../exceptions/messaging.exception';

// R8: a photo prompt is answered once issued and until midnight of its day.
export class PhotoPromptAnswerValidator {
    // Before it is issued, the prompt is secret: the answer is the one of an unknown prompt (domain.md rule 16).
    static ensureIssued(issuedAt: Date | null): Date {
        if (issuedAt !== null) return issuedAt;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_NOT_FOUND,
            message: 'Photo prompt not found',
        });
    }

    static ensureOpen(closesAt: Date, now: Date): void {
        if (now < closesAt) return;
        throw new MessagingException({
            code: MessagingExceptionCodeEnum.PHOTO_PROMPT_EXPIRED,
            message: 'Photo prompt passed at midnight',
        });
    }
}
