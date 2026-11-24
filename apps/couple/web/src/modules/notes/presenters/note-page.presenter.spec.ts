import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { A_SHARED_NOTE } from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { NotePageStepEnum } from '../view-models/note-page.view-model';
import { presentNotePage } from './note-page.presenter';

const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null = null,
): ApiError => ({ code, message: 'Refused', backendCode });

describe('Feature: the page of one note (decision 0036)', () => {
    it('shows the note with its link, owner and visibility', () => {
        const page = presentNotePage(ok(A_SHARED_NOTE));
        expect(page.viewModel).toMatchObject({
            step: NotePageStepEnum.NOTE,
            note: {
                noteId: A_SHARED_NOTE.noteId,
                href: `/notes/${A_SHARED_NOTE.noteId}`,
                title: A_SHARED_NOTE.title,
                isShared: true,
                isOwner: true,
            },
        });
    });

    it.each([
        [
            'a refused session',
            aRefusal(ApiErrorCodeEnum.UNAUTHORIZED),
            WebRouterEnum.ACCOUNT_SIGN_IN,
        ],
        [
            'R3, no formed couple',
            aRefusal(
                ApiErrorCodeEnum.NOT_FOUND,
                NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED,
            ),
            WebRouterEnum.COUPLE_PAIRING,
        ],
        [
            'R4, a note gone or private to the other',
            aRefusal(
                ApiErrorCodeEnum.NOT_FOUND,
                NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            ),
            WebRouterEnum.HOME,
        ],
        [
            'an identifier that is not a note id',
            aRefusal(ApiErrorCodeEnum.VALIDATION_ERROR),
            WebRouterEnum.HOME,
        ],
    ])('sends %s elsewhere', (_label, error, route) => {
        expect(presentNotePage(fail(error)).redirectTo).toBe(route);
    });

    it('shows any other failure on the page', () => {
        const error = aRefusal(ApiErrorCodeEnum.NETWORK_ERROR);
        expect(presentNotePage(fail(error))).toEqual({
            redirectTo: null,
            viewModel: { step: NotePageStepEnum.UNAVAILABLE, error },
        });
    });
});
