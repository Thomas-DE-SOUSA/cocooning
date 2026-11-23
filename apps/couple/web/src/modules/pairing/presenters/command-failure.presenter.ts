import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type CommandFailureFollowUp,
    CommandFailureFollowUpEnum,
} from '../view-models/pairing-screen.view-model';

// Decision 0036: a refused session goes back to sign-in; a couple that changed meanwhile is read again.
export function resolveCommandFailureFollowUp(
    error: ApiError,
): CommandFailureFollowUp {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return CommandFailureFollowUpEnum.SIGN_IN;
    }
    if (
        error.code === ApiErrorCodeEnum.CONFLICT ||
        error.code === ApiErrorCodeEnum.NOT_FOUND
    ) {
        return CommandFailureFollowUpEnum.REFRESH;
    }
    return CommandFailureFollowUpEnum.NONE;
}
