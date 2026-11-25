import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_NOTE_PAGE,
    THE_NOTE_SPACES,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { NotesStepEnum } from '../view-models/notes-screen.view-model';
import { presentNotesPage } from './notes-page.presenter';

const A_PRIVATE_NOTE_OF_THE_PARTNER = {
    noteId: '01936b2e-7c4a-7000-8000-0000000000c2',
    ownerId: '01936b2e-7c4a-7000-8000-0000000000a2',
    isOwner: false,
    title: 'Idées cadeaux',
    visibility: NoteVisibilityEnum.PRIVATE,
    folderId: null,
    updatedAt: '2026-11-23T16:05:00.000Z',
};

const aRefusal = (
    code: ApiError['code'],
    backendCode: string | null,
): ApiError => ({ code, message: 'Refused', backendCode });

describe('Feature: the home of the notes (decisions 0036, 0053)', () => {
    describe('Scenario: the API gives the spaces and the notes changed last', () => {
        it('R10, shows « Partagé » then « Privé » with what each holds', () => {
            const page = presentNotesPage({
                spaces: ok(THE_NOTE_SPACES),
                recentNotes: ok(A_NOTE_PAGE),
            });

            expect(page.viewModel).toMatchObject({
                step: NotesStepEnum.HOME,
                spaces: [
                    {
                        space: NoteSpaceEnum.SHARED,
                        href: '/spaces/SHARED',
                        folderCount: 1,
                        noteCount: 1,
                    },
                    {
                        space: NoteSpaceEnum.PRIVATE,
                        href: '/spaces/PRIVATE',
                        folderCount: 0,
                        noteCount: 0,
                    },
                ],
            });
        });

        it('lists each recent note with its visibility, owner and Paris time', () => {
            const page = presentNotesPage({
                spaces: ok(THE_NOTE_SPACES),
                recentNotes: ok({
                    ...A_NOTE_PAGE,
                    items: [A_PRIVATE_NOTE_OF_THE_PARTNER],
                }),
            });

            expect(page.viewModel).toMatchObject({
                recentNotes: [
                    {
                        noteId: A_PRIVATE_NOTE_OF_THE_PARTNER.noteId,
                        href: `/notes/${A_PRIVATE_NOTE_OF_THE_PARTNER.noteId}`,
                        title: 'Idées cadeaux',
                        isShared: false,
                        isOwner: false,
                        updatedAt: '23 nov. 2026, 17:05',
                    },
                ],
            });
        });
    });

    describe('Scenario: the API refuses a reading', () => {
        it('sends a refused session back to sign-in', () => {
            const page = presentNotesPage({
                spaces: fail(aRefusal(ApiErrorCodeEnum.UNAUTHORIZED, null)),
                recentNotes: ok(A_NOTE_PAGE),
            });
            expect(page.redirectTo).toBe(WebRouterEnum.ACCOUNT_SIGN_IN);
        });

        it('R3, sends a partner without a formed couple to pairing', () => {
            const page = presentNotesPage({
                spaces: ok(THE_NOTE_SPACES),
                recentNotes: fail(
                    aRefusal(
                        ApiErrorCodeEnum.NOT_FOUND,
                        NoteExceptionCodeEnum.NOTE_COUPLE_NOT_PAIRED,
                    ),
                ),
            });
            expect(page.redirectTo).toBe(WebRouterEnum.COUPLE_PAIRING);
        });

        it('shows any other failure on the screen', () => {
            const error = aRefusal(ApiErrorCodeEnum.NETWORK_ERROR, null);
            expect(
                presentNotesPage({
                    spaces: ok(THE_NOTE_SPACES),
                    recentNotes: fail(error),
                }),
            ).toEqual({
                redirectTo: null,
                viewModel: { step: NotesStepEnum.UNAVAILABLE, error },
            });
        });
    });
});
