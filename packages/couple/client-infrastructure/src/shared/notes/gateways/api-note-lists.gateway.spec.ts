import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_GROCERY_LIST,
    A_NOTE_LIST_INDEX,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import type { NoteListKind } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveNoteListsEndpoints } from '../endpoints/note-lists.endpoints';
import { ApiNoteListsGateway } from './api-note-lists.gateway';

const LIST_ID = A_GROCERY_LIST.noteId;
const SESSION_HEADERS = {
    Accept: 'application/json',
    Cookie: 'cocooning_session=session-token-1',
};
const { NOTE_LIST_NOT_FOUND, NOTE_LIST_EMOJI_INVALID, NOTE_NOT_FOUND } =
    NoteExceptionCodeEnum;
const { NOT_FOUND, VALIDATION_ERROR, UNAUTHORIZED, INVALID_RESPONSE } =
    ApiErrorCodeEnum;

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiNoteListsGateway(
        resolveNoteListsEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );
const anApiRefusal = (status: number, code: string) =>
    JSON.stringify({ status, code, message: 'Refused', context: null });

describe('Feature: the PWA reaches the lists through the API (R26, R28)', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: R28, the partner opens a section', () => {
        it('asks for the section with the session and reads its lists', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_NOTE_LIST_INDEX));
            await expect(aGateway().listOf('GROCERIES')).resolves.toEqual(
                ok(A_NOTE_LIST_INDEX),
            );
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/note-lists?kind=GROCERIES',
                    method: 'GET',
                    headers: SESSION_HEADERS,
                    body: null,
                },
            ]);
        });

        it('refuses a list whose count is not a number', async () => {
            const withoutCount = { ...A_GROCERY_LIST, openItemCount: null };
            fakeFetch.givenResponse(
                200,
                JSON.stringify({ items: [withoutCount] }),
            );
            const result = await aGateway().listOf('TASKS');
            expect(result.success === false && result.error.code).toBe(
                INVALID_RESPONSE,
            );
        });
    });

    describe('Scenario: R26, the partner creates and edits a list', () => {
        it('posts the new list, then patches its title and emoji', async () => {
            fakeFetch.givenResponse(201, JSON.stringify(A_GROCERY_LIST));
            const gateway = aGateway();
            await expect(
                gateway.create({
                    kind: 'GROCERIES',
                    space: 'SHARED',
                    title: ' Carrefour ',
                    emoji: ' 🛒 ',
                }),
            ).resolves.toEqual(ok(A_GROCERY_LIST));
            await gateway.edit(LIST_ID, { title: 'Lidl', emoji: null });
            expect(
                fakeFetch.calls.map(({ url, method, body }) => ({
                    url,
                    method,
                    body,
                })),
            ).toEqual([
                {
                    url: 'http://api.test/note-lists',
                    method: 'POST',
                    body: JSON.stringify({
                        kind: 'GROCERIES',
                        space: 'SHARED',
                        title: 'Carrefour',
                        emoji: '🛒',
                    }),
                },
                {
                    url: `http://api.test/note-lists/${LIST_ID}`,
                    method: 'PATCH',
                    body: JSON.stringify({ title: 'Lidl', emoji: null }),
                },
            ]);
        });
    });

    describe('Scenario: the API refuses a list action', () => {
        it.each([
            [404, NOTE_LIST_NOT_FOUND, NOT_FOUND],
            [404, NOTE_NOT_FOUND, NOT_FOUND],
            [422, NOTE_LIST_EMOJI_INVALID, VALIDATION_ERROR],
        ])('turns a %i %s into %s', async (status, backendCode, code) => {
            fakeFetch.givenResponse(status, anApiRefusal(status, backendCode));
            await expect(
                aGateway().edit(LIST_ID, { title: 'Lidl', emoji: null }),
            ).resolves.toEqual(fail({ code, message: 'Refused', backendCode }));
        });
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it.each([
            [
                'an unknown section',
                () => aGateway().listOf('WISHES' as NoteListKind),
            ],
            [
                'an empty title',
                () =>
                    aGateway().create({
                        kind: 'TASKS',
                        space: 'PRIVATE',
                        title: ' ',
                        emoji: null,
                    }),
            ],
            [
                'an emoji over the limit',
                () =>
                    aGateway().edit(LIST_ID, {
                        title: 'Noël',
                        emoji: '🎄'.repeat(17),
                    }),
            ],
        ])('refuses %s without calling the API', async (_label, call) => {
            const result = await call();
            expect(result.success === false && result.error.code).toBe(
                VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });

        it('refuses without calling the API when there is no session', async () => {
            const result = await aGateway(null).listOf('GROCERIES');
            expect(result.success === false && result.error.code).toBe(
                UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
