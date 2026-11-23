import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NotePageResponse,
    type NoteResponse,
} from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import { I18N_CONFIG } from '@/i18n/config';
import type {
    NoteListItem,
    NotesPage,
} from '../view-models/notes-screen.view-model';
import { NotesStepEnum } from '../view-models/notes-screen.view-model';

const UPDATED_AT_FORMAT = new Intl.DateTimeFormat(I18N_CONFIG.defaultLocale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: I18N_CONFIG.timeZone,
});

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

const toNoteListItem = (note: NoteResponse): NoteListItem => ({
    noteId: note.noteId,
    title: note.title,
    isShared: note.visibility === NoteVisibilityEnum.SHARED,
    isOwner: note.isOwner,
    updatedAt: UPDATED_AT_FORMAT.format(new Date(note.updatedAt)),
});
