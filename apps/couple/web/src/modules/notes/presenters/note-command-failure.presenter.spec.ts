import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { NoteCommandFailureFollowUpEnum } from '../view-models/note-command.view-model';
import { resolveNoteCommandFailureFollowUp } from './note-command-failure.presenter';

const aRefusal = (
    code: (typeof ApiErrorCodeEnum)[keyof typeof ApiErrorCodeEnum],
) => ({ code, message: 'Refused', backendCode: null });

describe('Feature: what follows a refused note command', () => {
    it.each([
        [ApiErrorCodeEnum.UNAUTHORIZED, NoteCommandFailureFollowUpEnum.SIGN_IN],
        [ApiErrorCodeEnum.NOT_FOUND, NoteCommandFailureFollowUpEnum.REFRESH],
        [ApiErrorCodeEnum.FORBIDDEN, NoteCommandFailureFollowUpEnum.REFRESH],
        [ApiErrorCodeEnum.CONFLICT, NoteCommandFailureFollowUpEnum.REFRESH],
        [
            ApiErrorCodeEnum.VALIDATION_ERROR,
            NoteCommandFailureFollowUpEnum.NONE,
        ],
        [ApiErrorCodeEnum.NETWORK_ERROR, NoteCommandFailureFollowUpEnum.NONE],
    ])('answers %s with %s', (code, followUp) => {
        expect(resolveNoteCommandFailureFollowUp(aRefusal(code))).toBe(
            followUp,
        );
    });
});
