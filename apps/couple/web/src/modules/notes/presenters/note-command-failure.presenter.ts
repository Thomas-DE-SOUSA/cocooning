import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    type NoteCommandFailureFollowUp,
    NoteCommandFailureFollowUpEnum,
} from '../view-models/note-command.view-model';

const STALE_LIST_CODES: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.FORBIDDEN,
    ApiErrorCodeEnum.CONFLICT,
];

// Decision 0036: a refused session goes back to sign-in; a note changed by the other partner (made private, deleted) is read again.
export function resolveNoteCommandFailureFollowUp(
    error: ApiError,
): NoteCommandFailureFollowUp {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return NoteCommandFailureFollowUpEnum.SIGN_IN;
    }
    if (STALE_LIST_CODES.includes(error.code)) {
        return NoteCommandFailureFollowUpEnum.REFRESH;
    }
    return NoteCommandFailureFollowUpEnum.NONE;
}
