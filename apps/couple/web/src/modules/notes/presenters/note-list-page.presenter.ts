import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NoteDetailResponse,
} from '@cocooning/couple-contract/notes';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import {
    type NoteListPage,
    NoteListPageStepEnum,
} from '../view-models/note-list-page.view-model';
import { noteListsSectionHref } from './note-list-href.presenter';
import { toNoteListItem } from './note-list-item.presenter';

const BACK_TO_LISTS: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.VALIDATION_ERROR,
];

const redirectTo = (route: string): NoteListPage => ({
    redirectTo: route,
    viewModel: null,
});

// The API says whether the reader owns the list; the other partner of the couple reads it otherwise.
const viewerIdOf = (
    note: NoteDetailResponse,
    couple: CoupleResponse,
): string | null => {
    if (note.isOwner) return note.ownerId;
    const other = couple.partners.find(({ userId }) => userId !== note.ownerId);
    return other === undefined ? null : other.userId;
};

// The page checks the couple first (resolveHomeDestination). R26: a note that is no list opens on its own page; a list gone or private to the other goes back to the lists (R4).
export function presentNoteListPage(
    reading: Result<NoteDetailResponse, ApiError>,
    couple: Result<CoupleResponse | null, ApiError>,
): NoteListPage {
    if (!reading.success) return presentRefusal(reading.error);
    const note = reading.value;
    if (note.listKind === null) return redirectTo(toNoteListItem(note).href);
    if (!couple.success || couple.value === null) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    const viewerId = viewerIdOf(note, couple.value);
    if (viewerId === null) return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    return {
        redirectTo: null,
        viewModel: {
            step: NoteListPageStepEnum.LIST,
            list: {
                noteId: note.noteId,
                title: note.title,
                emoji: note.emoji,
                kind: note.listKind,
                isShared: note.visibility === NoteVisibilityEnum.SHARED,
                isOwner: note.isOwner,
                backHref: noteListsSectionHref(note.listKind),
                viewerId,
            },
        },
    };
}

function presentRefusal(error: ApiError): NoteListPage {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (error.backendCode === NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    if (BACK_TO_LISTS.includes(error.code)) {
        return redirectTo(WebRouterEnum.NOTE_LISTS);
    }
    return {
        redirectTo: null,
        viewModel: { step: NoteListPageStepEnum.UNAVAILABLE, error },
    };
}
