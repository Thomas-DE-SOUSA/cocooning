import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NoteListResponse,
} from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import {
    type NoteListCard,
    type NoteListsPage,
    type NoteListsReading,
    type NoteListsSection,
    NoteListsSectionEnum,
    type NoteListsSectionTab,
    NoteListsStepEnum,
} from '../view-models/note-lists-screen.view-model';
import { noteListHref } from './note-list-href.presenter';
import { presentNoteListsTabs } from './note-lists-query.presenter';

const redirectTo = (route: string): NoteListsPage => ({
    redirectTo: route,
    viewModel: null,
});

const toCard = (list: NoteListResponse): NoteListCard => ({
    noteId: list.noteId,
    href: noteListHref(list.noteId),
    title: list.title,
    emoji: list.emoji,
    openItemCount: list.openItemCount,
});

const isShared = (list: NoteListResponse): boolean =>
    list.visibility === NoteVisibilityEnum.SHARED;

// R28: « Communes », then « Rien que pour moi », each in the order of the API (the most recently changed first).
// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no lists (R3).
export function presentNoteListsPage(
    section: NoteListsSection,
    reading: NoteListsReading,
): NoteListsPage {
    const tabs = presentNoteListsTabs(section);
    if (section === NoteListsSectionEnum.WISHES || reading === null) {
        return {
            redirectTo: null,
            viewModel: { step: NoteListsStepEnum.WISHES, tabs },
        };
    }
    if (reading.success) {
        const { items } = reading.value;
        return {
            redirectTo: null,
            viewModel: {
                step: NoteListsStepEnum.LISTS,
                tabs,
                kind: section,
                shared: items.filter(isShared).map(toCard),
                mine: items.filter((list) => !isShared(list)).map(toCard),
            },
        };
    }
    return presentRefusal(reading.error, tabs);
}

function presentRefusal(
    error: ApiError,
    tabs: readonly NoteListsSectionTab[],
): NoteListsPage {
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (error.backendCode === NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    return {
        redirectTo: null,
        viewModel: { step: NoteListsStepEnum.UNAVAILABLE, tabs, error },
    };
}
