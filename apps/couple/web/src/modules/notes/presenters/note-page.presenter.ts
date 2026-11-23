import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NoteResponse,
} from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import {
    type NotePage,
    NotePageStepEnum,
} from '../view-models/note-page.view-model';
import { toNoteListItem } from './note-list-item.presenter';

// The list is where a partner goes back to: a note gone (deleted, made private by the other, R4) or an invalid id.
const BACK_TO_THE_LIST: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.VALIDATION_ERROR,
];

const redirectTo = (route: string): NotePage => ({
    redirectTo: route,
    viewModel: null,
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no notes (R3).
export function presentNotePage(
    note: Result<NoteResponse, ApiError>,
): NotePage {
    if (note.success) {
        return {
            redirectTo: null,
            viewModel: {
                step: NotePageStepEnum.NOTE,
                note: toNoteListItem(note.value),
            },
        };
    }
    const { error } = note;
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (error.backendCode === NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    if (BACK_TO_THE_LIST.includes(error.code)) {
        return redirectTo(WebRouterEnum.HOME);
    }
    return {
        redirectTo: null,
        viewModel: { step: NotePageStepEnum.UNAVAILABLE, error },
    };
}
