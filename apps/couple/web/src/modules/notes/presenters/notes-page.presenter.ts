import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NotePageResponse,
} from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NotesPage } from '../view-models/notes-screen.view-model';
import { NotesStepEnum } from '../view-models/notes-screen.view-model';
import { toNoteListItem } from './note-list-item.presenter';

const redirectTo = (route: string): NotesPage => ({
    redirectTo: route,
    viewModel: null,
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no notes (R3).
export function presentNotesPage(
    page: Result<NotePageResponse, ApiError>,
): NotesPage {
    if (!page.success) return presentRefusal(page.error);
    return {
        redirectTo: null,
        viewModel: {
            step: NotesStepEnum.LIST,
            notes: page.value.items.map(toNoteListItem),
        },
    };
}

function presentRefusal(error: ApiError): NotesPage {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (error.backendCode === NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    return {
        redirectTo: null,
        viewModel: { step: NotesStepEnum.UNAVAILABLE, error },
    };
}
