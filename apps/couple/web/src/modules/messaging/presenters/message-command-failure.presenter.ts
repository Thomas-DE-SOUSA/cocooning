import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type MessageCommandFailureFollowUp,
    MessageCommandFailureFollowUpEnum,
} from '../view-models/message-command.view-model';

const STALE_FEED_CODES: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.FORBIDDEN,
    ApiErrorCodeEnum.CONFLICT,
];

// Decision 0036: a refused session goes back to sign-in; a feed changed meanwhile (withdrawn item, answered prompt) is read again.
export function resolveMessageCommandFailureFollowUp(
    error: ApiError,
): MessageCommandFailureFollowUp {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return MessageCommandFailureFollowUpEnum.SIGN_IN;
    }
    if (STALE_FEED_CODES.includes(error.code)) {
        return MessageCommandFailureFollowUpEnum.REFRESH;
    }
    return MessageCommandFailureFollowUpEnum.NONE;
}
