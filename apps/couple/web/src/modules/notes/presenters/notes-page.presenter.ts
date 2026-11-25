import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NotePageResponse,
    type NoteSpacesResponse,
} from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    type NotesHomeReading,
    type NotesPage,
    NotesStepEnum,
} from '../view-models/notes-screen.view-model';
import { toNoteListItem } from './note-list-item.presenter';
import { presentNotePlace } from './note-place.presenter';

const redirectTo = (route: string): NotesPage => ({
    redirectTo: route,
    viewModel: null,
});

const presentHome = (
    spaces: NoteSpacesResponse,
    recentNotes: NotePageResponse,
): NotesPage => ({
    redirectTo: null,
    viewModel: {
        step: NotesStepEnum.HOME,
        spaces: spaces.spaces.map((summary) => ({
            ...summary,
            href: presentNotePlace(summary.space, null).href,
        })),
        recentNotes: recentNotes.items.map(toNoteListItem),
    },
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no notes (R3).
export function presentNotesPage({
    spaces,
    recentNotes,
}: NotesHomeReading): NotesPage {
    if (!spaces.success) return presentRefusal(spaces.error);
    if (!recentNotes.success) return presentRefusal(recentNotes.error);
    return presentHome(spaces.value, recentNotes.value);
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
