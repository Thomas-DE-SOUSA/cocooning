import {
    A_GROCERY_LIST,
    A_NOTE_LIST_INDEX,
} from '@cocooning/couple-client-business-logic/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { NoteListsStepEnum } from '../view-models/note-lists-screen.view-model';
import { presentNoteListsPage } from './note-lists-page.presenter';
import {
    noteListKindOf,
    presentNoteListsQuery,
} from './note-lists-query.presenter';

const UNREACHABLE = {
    code: ApiErrorCodeEnum.NETWORK_ERROR,
    message: 'Unreachable',
    backendCode: null,
};

describe('Feature: the Lists tab (R28, decision 0058)', () => {
    it('opens Courses when the section is missing or unknown', () => {
        expect(presentNoteListsQuery({})).toBe('GROCERIES');
        expect(presentNoteListsQuery({ section: 'SHOPPING' })).toBe(
            'GROCERIES',
        );
        expect(presentNoteListsQuery({ section: 'TASKS' })).toBe('TASKS');
        expect(noteListKindOf('WISHES')).toBeNull();
    });

    it('groups the lists in « Communes » then « Rien que pour moi », with their link and what is left', () => {
        const page = presentNoteListsPage('GROCERIES', ok(A_NOTE_LIST_INDEX));

        expect(page.viewModel).toEqual({
            step: NoteListsStepEnum.LISTS,
            tabs: [
                {
                    section: 'GROCERIES',
                    href: '/lists?section=GROCERIES',
                    isCurrent: true,
                },
                {
                    section: 'TASKS',
                    href: '/lists?section=TASKS',
                    isCurrent: false,
                },
                {
                    section: 'WISHES',
                    href: '/lists?section=WISHES',
                    isCurrent: false,
                },
            ],
            kind: 'GROCERIES',
            shared: [
                {
                    noteId: A_GROCERY_LIST.noteId,
                    href: `/lists/${A_GROCERY_LIST.noteId}`,
                    title: 'Carrefour',
                    emoji: '🛒',
                    openItemCount: 3,
                },
            ],
            mine: [
                expect.objectContaining({
                    title: 'Pharmacie',
                    openItemCount: 0,
                }),
            ],
        });
    });

    it('shows Envies without reading any list', () => {
        expect(presentNoteListsPage('WISHES', null).viewModel?.step).toBe(
            NoteListsStepEnum.WISHES,
        );
    });

    it.each([
        [ApiErrorCodeEnum.UNAUTHORIZED, null, WebRouterEnum.ACCOUNT_SIGN_IN],
        [
            ApiErrorCodeEnum.NOT_FOUND,
            'NOTE_COUPLE_NOT_PAIRED',
            WebRouterEnum.COUPLE_PAIRING,
        ],
    ])('sends a %s refusal elsewhere', (code, backendCode, route) => {
        const error = { code, message: 'Refused', backendCode };
        expect(presentNoteListsPage('TASKS', fail(error)).redirectTo).toBe(
            route,
        );
    });

    it('keeps the sections above a list it could not read', () => {
        const page = presentNoteListsPage('TASKS', fail(UNREACHABLE));

        expect(page.viewModel).toEqual(
            expect.objectContaining({
                step: NoteListsStepEnum.UNAVAILABLE,
                error: UNREACHABLE,
            }),
        );
    });
});
