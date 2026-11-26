import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_FOLDER,
    A_SHARED_NOTE,
    A_SMART_SPACE_CONTENTS,
    A_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { NotePageStepEnum } from '../view-models/note-page.view-model';
import { presentNotePage } from './note-page.presenter';

const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null = null,
): ApiError => ({ code, message: 'Refused', backendCode });

const A_NOTE = { ...A_SHARED_NOTE, card: null, listKind: null, emoji: null };
const VACANCES = { folderId: A_SHARED_FOLDER.folderId, name: 'Vacances' };

describe('Feature: the page of one note (decision 0036)', () => {
    it('shows the note with its link, owner and visibility', () => {
        const page = presentNotePage(
            ok({ note: A_NOTE, place: A_SPACE_CONTENTS }),
        );
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

    it('R20, R25, shows the card of a note in a smart folder, with « Mettre à jour »', () => {
        const [filled] = A_SMART_SPACE_CONTENTS.notes;
        const page = presentNotePage(
            ok({ note: filled!, place: A_SMART_SPACE_CONTENTS }),
        );
        expect(page.viewModel).toMatchObject({
            card: { noteId: filled!.noteId, canRefresh: true },
        });
    });

    it('R27, opens a list on its own page', () => {
        const page = presentNotePage(
            ok({
                note: { ...A_NOTE, listKind: 'GROCERIES', emoji: '🛒' },
                place: A_SPACE_CONTENTS,
            }),
        );
        expect(page.redirectTo).toBe(`/lists/${A_SHARED_NOTE.noteId}`);
    });

    it('has no card for a note outside a smart folder', () => {
        const page = presentNotePage(
            ok({ note: A_NOTE, place: A_SPACE_CONTENTS }),
        );
        expect(page.viewModel).toMatchObject({ card: null });
    });

    it('goes back to the root of the space of a note at the root', () => {
        const page = presentNotePage(
            ok({ note: A_NOTE, place: A_SPACE_CONTENTS }),
        );
        expect(page.viewModel).toMatchObject({
            level: {
                place: { folder: null, href: '/spaces/SHARED' },
                folders: [expect.objectContaining({ name: 'Vacances' })],
            },
        });
    });

    it('goes back to the folder of a note, the first level of its move picker', () => {
        const page = presentNotePage(
            ok({
                note: { ...A_NOTE, folderId: VACANCES.folderId },
                place: { ...A_SPACE_CONTENTS, path: [VACANCES], folders: [] },
            }),
        );
        expect(page.viewModel).toMatchObject({
            level: {
                place: {
                    folder: VACANCES,
                    href: `/spaces/SHARED?folderId=${VACANCES.folderId}`,
                },
                back: { folder: null },
                folders: [],
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
            'a note whose folder went meanwhile',
            aRefusal(
                ApiErrorCodeEnum.NOT_FOUND,
                NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
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
