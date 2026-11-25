import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    NoteExceptionCodeEnum,
    type NoteSpaceContentsResponse,
} from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import type { NoteLocation } from '../view-models/note-place.view-model';
import {
    type NoteSpacePage,
    NoteSpaceStepEnum,
} from '../view-models/note-space-screen.view-model';
import { presentCardContext } from './card-context.presenter';
import { toNoteListItem } from './note-list-item.presenter';
import { presentNotePlace } from './note-place.presenter';
import { presentPlaceLevel } from './place-level.presenter';

// A folder gone (deleted, or in the other's « Privé », R14) or of another space: back to the root of the space.
const BACK_TO_THE_ROOT: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.VALIDATION_ERROR,
];

const redirectTo = (route: string): NoteSpacePage => ({
    redirectTo: route,
    viewModel: null,
});

const presentContents = (
    contents: NoteSpaceContentsResponse,
): NoteSpacePage => ({
    redirectTo: null,
    viewModel: {
        step: NoteSpaceStepEnum.CONTENTS,
        ...presentPlaceLevel(contents),
        notes: contents.notes.map(toNoteListItem),
        cardContext: presentCardContext(contents),
    },
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no notes (R3).
export function presentNoteSpacePage(
    location: NoteLocation,
    contents: Result<NoteSpaceContentsResponse, ApiError>,
): NoteSpacePage {
    if (contents.success) return presentContents(contents.value);
    const { error } = contents;
    const root = presentNotePlace(location.space, null);
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (error.backendCode === NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    if (location.folderId !== null && BACK_TO_THE_ROOT.includes(error.code)) {
        return redirectTo(root.href);
    }
    return {
        redirectTo: null,
        viewModel: {
            step: NoteSpaceStepEnum.UNAVAILABLE,
            place: root,
            back: null,
            error,
        },
    };
}
