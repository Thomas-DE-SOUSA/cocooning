import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { A_SHARED_NOTE } from '@cocooning/couple-client-business-logic/testing';
import type { CoupleResponse } from '@cocooning/couple-contract/pairing';
import { WebRouterEnum } from '@cocooning/couple-shared-kernel/routers';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { NoteListPageStepEnum } from '../view-models/note-list-page.view-model';
import { presentNoteListPage } from './note-list-page.presenter';

const OWNER = A_SHARED_NOTE.ownerId;
const PARTNER = '01936b2e-7c4a-7000-8000-0000000000a2';
const A_COUPLE: CoupleResponse = {
    coupleId: '01936b2e-7c4a-7000-8000-0000000000c1',
    pairingStatus: 'PAIRED',
    partners: [
        { userId: OWNER, joinedAt: '2026-11-01T10:00:00.000Z' },
        { userId: PARTNER, joinedAt: '2026-11-02T10:00:00.000Z' },
    ],
    invitationCode: null,
    togetherPeriods: [],
};
const CARREFOUR = {
    ...A_SHARED_NOTE,
    title: 'Carrefour',
    card: null,
    listKind: 'GROCERIES' as const,
    emoji: '🛒',
};
const aRefusal = (code: ApiError['code'], backendCode: string | null = null) =>
    fail({ code, message: 'Refused', backendCode });

describe('Feature: the page of a list (R26, R29)', () => {
    it('shows the list to its owner, the way back to its section', () => {
        expect(
            presentNoteListPage(ok(CARREFOUR), ok(A_COUPLE)).viewModel,
        ).toEqual({
            step: NoteListPageStepEnum.LIST,
            list: {
                noteId: CARREFOUR.noteId,
                title: 'Carrefour',
                emoji: '🛒',
                kind: 'GROCERIES',
                isShared: true,
                isOwner: true,
                backHref: '/lists?section=GROCERIES',
                viewerId: OWNER,
            },
        });
    });

    it('knows the other partner as the reader of a list they do not own', () => {
        const page = presentNoteListPage(
            ok({ ...CARREFOUR, isOwner: false }),
            ok(A_COUPLE),
        );

        expect(page.viewModel).toMatchObject({ list: { viewerId: PARTNER } });
    });

    it('opens a note that is no list on its own page', () => {
        const page = presentNoteListPage(
            ok({ ...CARREFOUR, listKind: null }),
            ok(A_COUPLE),
        );

        expect(page.redirectTo).toBe(`/notes/${CARREFOUR.noteId}`);
    });

    it.each([
        [
            aRefusal(ApiErrorCodeEnum.UNAUTHORIZED),
            WebRouterEnum.ACCOUNT_SIGN_IN,
        ],
        [
            aRefusal(ApiErrorCodeEnum.NOT_FOUND, 'NOTE_COUPLE_NOT_PAIRED'),
            WebRouterEnum.COUPLE_PAIRING,
        ],
        [
            aRefusal(ApiErrorCodeEnum.NOT_FOUND, 'NOTE_NOT_FOUND'),
            WebRouterEnum.NOTE_LISTS,
        ],
        [aRefusal(ApiErrorCodeEnum.VALIDATION_ERROR), WebRouterEnum.NOTE_LISTS],
    ])('sends a refusal where the partner can act (%#)', (reading, route) => {
        expect(presentNoteListPage(reading, ok(A_COUPLE)).redirectTo).toBe(
            route,
        );
    });

    it('needs the couple to know who reads the list', () => {
        expect(presentNoteListPage(ok(CARREFOUR), ok(null)).redirectTo).toBe(
            WebRouterEnum.COUPLE_PAIRING,
        );
    });

    it('says why a list could not be read', () => {
        const page = presentNoteListPage(
            aRefusal(ApiErrorCodeEnum.NETWORK_ERROR),
            ok(A_COUPLE),
        );

        expect(page.viewModel?.step).toBe(NoteListPageStepEnum.UNAVAILABLE);
    });
});
