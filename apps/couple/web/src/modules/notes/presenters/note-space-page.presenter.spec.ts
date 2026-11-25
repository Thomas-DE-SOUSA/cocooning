import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_FOLDER,
    A_SHARED_NOTE,
    A_SPACE_CONTENTS,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { NoteSpaceStepEnum } from '../view-models/note-space-screen.view-model';
import { presentNoteSpacePage } from './note-space-page.presenter';

const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };
const IN_A_FOLDER = {
    space: NoteSpaceEnum.SHARED,
    folderId: A_SHARED_FOLDER.folderId,
};
const TRAVAUX = {
    folderId: '01936b2e-7c4a-7000-8000-0000000000e2',
    name: 'Travaux',
};
const FOLDER_HREF = `/spaces/SHARED?folderId=${A_SHARED_FOLDER.folderId}`;

const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null = null,
): ApiError => ({ code, message: 'Refused', backendCode });

describe('Feature: the screen of a space or a folder (R10, R14)', () => {
    describe('Scenario: the root of « Partagé »', () => {
        it('lists its folders with their counts, then its notes, and goes back home', () => {
            const page = presentNoteSpacePage(
                SHARED_ROOT,
                ok(A_SPACE_CONTENTS),
            );

            expect(page.viewModel).toEqual({
                step: NoteSpaceStepEnum.CONTENTS,
                place: {
                    space: NoteSpaceEnum.SHARED,
                    folder: null,
                    href: '/spaces/SHARED',
                },
                back: null,
                folders: [
                    {
                        folderId: A_SHARED_FOLDER.folderId,
                        name: 'Vacances',
                        href: FOLDER_HREF,
                        folderCount: 0,
                        noteCount: 2,
                    },
                ],
                notes: [
                    expect.objectContaining({
                        noteId: A_SHARED_NOTE.noteId,
                        href: `/notes/${A_SHARED_NOTE.noteId}`,
                    }),
                ],
            });
        });
    });

    describe('Scenario: a folder and a sub-folder', () => {
        it('goes back from a folder to the root of its space', () => {
            const vacances = {
                folderId: A_SHARED_FOLDER.folderId,
                name: 'Vacances',
            };
            const page = presentNoteSpacePage(
                IN_A_FOLDER,
                ok({ ...A_SPACE_CONTENTS, path: [vacances] }),
            );

            expect(page.viewModel).toMatchObject({
                place: { folder: vacances, href: FOLDER_HREF },
                back: { folder: null, href: '/spaces/SHARED' },
            });
        });

        it('goes back from a sub-folder to its parent folder', () => {
            const vacances = {
                folderId: A_SHARED_FOLDER.folderId,
                name: 'Vacances',
            };
            const page = presentNoteSpacePage(
                { ...IN_A_FOLDER, folderId: TRAVAUX.folderId },
                ok({ ...A_SPACE_CONTENTS, path: [vacances, TRAVAUX] }),
            );

            expect(page.viewModel).toMatchObject({
                place: { folder: TRAVAUX },
                back: { folder: vacances, href: FOLDER_HREF },
            });
        });
    });

    describe('Scenario: the API refuses the reading', () => {
        it.each([
            [
                'a refused session to sign-in',
                SHARED_ROOT,
                aRefusal(ApiErrorCodeEnum.UNAUTHORIZED),
                WebRouterEnum.ACCOUNT_SIGN_IN,
            ],
            [
                'R3, a partner without a formed couple to pairing',
                SHARED_ROOT,
                aRefusal(
                    ApiErrorCodeEnum.NOT_FOUND,
                    NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED,
                ),
                WebRouterEnum.COUPLE_PAIRING,
            ],
            [
                'R14, a folder gone or private to the other to the root',
                IN_A_FOLDER,
                aRefusal(
                    ApiErrorCodeEnum.NOT_FOUND,
                    NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                ),
                '/spaces/SHARED',
            ],
            [
                'a folder of the other space to the root',
                IN_A_FOLDER,
                aRefusal(
                    ApiErrorCodeEnum.VALIDATION_ERROR,
                    NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
                ),
                '/spaces/SHARED',
            ],
        ])('sends %s', (_label, location, error, route) => {
            expect(presentNoteSpacePage(location, fail(error)).redirectTo).toBe(
                route,
            );
        });

        it('shows any other failure under the name of the space', () => {
            const error = aRefusal(ApiErrorCodeEnum.NOT_FOUND);

            expect(presentNoteSpacePage(SHARED_ROOT, fail(error))).toEqual({
                redirectTo: null,
                viewModel: {
                    step: NoteSpaceStepEnum.UNAVAILABLE,
                    place: {
                        space: NoteSpaceEnum.SHARED,
                        folder: null,
                        href: '/spaces/SHARED',
                    },
                    back: null,
                    error,
                },
            });
        });
    });
});
