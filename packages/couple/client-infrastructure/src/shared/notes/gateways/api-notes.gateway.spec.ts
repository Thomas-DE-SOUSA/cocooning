import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_NOTE_PAGE,
    A_SHARED_NOTE,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveNotesEndpoints } from '../endpoints/notes.endpoints';
import { ApiNotesGateway } from './api-notes.gateway';

const NOTE_ID = A_SHARED_NOTE.noteId;
const SESSION_COOKIE = { Cookie: 'cocooning_session=session-token-1' };
const ACCEPT = { Accept: 'application/json' };
const JSON_BODY = { ...ACCEPT, 'Content-Type': 'application/json' };

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiNotesGateway(
        resolveNotesEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );

describe('Feature: the PWA reaches the notes through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: each action for the signed-in partner', () => {
        it('lists one page with the session cookie (decision 0025)', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_NOTE_PAGE));
            await expect(
                aGateway().listNotes({ page: 2, pageSize: 10 }),
            ).resolves.toEqual(ok(A_NOTE_PAGE));
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/notes?page=2&pageSize=10',
                    method: 'GET',
                    headers: { ...ACCEPT, ...SESSION_COOKIE },
                    body: null,
                },
            ]);
        });

        it('creates and renames with the trimmed title', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_SHARED_NOTE));
            await aGateway().createNote({
                title: ' Courses ',
                space: 'SHARED',
                folderId: null,
            });
            await aGateway().renameNote(NOTE_ID, {
                title: 'Courses du samedi',
            });
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/notes',
                    method: 'POST',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify({
                        title: 'Courses',
                        space: 'SHARED',
                        folderId: null,
                    }),
                },
                {
                    url: `http://api.test/notes/${NOTE_ID}`,
                    method: 'PATCH',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify({ title: 'Courses du samedi' }),
                },
            ]);
        });

        it.each([
            ['opens', 'getNote', 'GET', `/notes/${NOTE_ID}`],
            ['shares', 'shareNote', 'POST', `/notes/${NOTE_ID}/share`],
            [
                'makes private',
                'makeNotePrivate',
                'POST',
                `/notes/${NOTE_ID}/make-private`,
            ],
        ] as const)('%s a note', async (_label, operation, method, path) => {
            fakeFetch.givenResponse(200, JSON.stringify(A_SHARED_NOTE));
            await expect(aGateway()[operation](NOTE_ID)).resolves.toEqual(
                ok(A_SHARED_NOTE),
            );
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test${path}`,
                method,
            });
        });

        it('deletes a note from a 204 without body (R7)', async () => {
            fakeFetch.givenResponse(204, '');
            await expect(aGateway().deleteNote(NOTE_ID)).resolves.toEqual(
                ok(null),
            );
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test/notes/${NOTE_ID}`,
                method: 'DELETE',
            });
        });
    });

    describe('Scenario: R5, R7, the API reserves the action to the owner', () => {
        it('returns FORBIDDEN with the backend code', async () => {
            fakeFetch.givenResponse(
                403,
                JSON.stringify({
                    status: 403,
                    code: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
                    message: 'Reserved to the owner of the note',
                    context: null,
                }),
            );
            await expect(aGateway().deleteNote(NOTE_ID)).resolves.toEqual(
                fail({
                    code: ApiErrorCodeEnum.FORBIDDEN,
                    message: 'Reserved to the owner of the note',
                    backendCode: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
                }),
            );
        });
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it('refuses an empty title without calling the API', async () => {
            const result = await aGateway().createNote({
                title: ' ',
                space: 'SHARED',
                folderId: null,
            });
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });

        it('refuses without calling the API when there is no session', async () => {
            const result = await aGateway(null).listNotes({
                page: 1,
                pageSize: 25,
            });
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
