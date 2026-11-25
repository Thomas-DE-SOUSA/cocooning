import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import type { Result } from '@cocooning/shared-kernel/utils';
import {
    type NotePage,
    NotePageStepEnum,
    type NoteReading,
} from '../view-models/note-page.view-model';
import { toNoteListItem } from './note-list-item.presenter';
import { presentPlaceLevel } from './place-level.presenter';

// The home is where a partner goes back to: a note gone (deleted, made private by the other, R4), its folder gone
// meanwhile, or an invalid id.
const BACK_HOME: readonly ApiError['code'][] = [
    ApiErrorCodeEnum.NOT_FOUND,
    ApiErrorCodeEnum.VALIDATION_ERROR,
];

const redirectTo = (route: string): NotePage => ({
    redirectTo: route,
    viewModel: null,
});

// Decision 0036: a refused session goes back to sign-in; without a formed couple there are no notes (R3).
export function presentNotePage(
    reading: Result<NoteReading, ApiError>,
): NotePage {
    if (reading.success) {
        return {
            redirectTo: null,
            viewModel: {
                step: NotePageStepEnum.NOTE,
                note: toNoteListItem(reading.value.note),
                level: presentPlaceLevel(reading.value.place),
            },
        };
    }
    const { error } = reading;
    if (error.code === ApiErrorCodeEnum.UNAUTHORIZED) {
        return redirectTo(WebRouterEnum.ACCOUNT_SIGN_IN);
    }
    if (error.backendCode === NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED) {
        return redirectTo(WebRouterEnum.COUPLE_PAIRING);
    }
    if (BACK_HOME.includes(error.code)) {
        return redirectTo(WebRouterEnum.HOME);
    }
    return {
        redirectTo: null,
        viewModel: { step: NotePageStepEnum.UNAVAILABLE, error },
    };
}
