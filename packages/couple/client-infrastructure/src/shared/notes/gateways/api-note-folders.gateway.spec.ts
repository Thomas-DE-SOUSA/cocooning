import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_FOLDER,
    A_SHARED_NOTE,
    A_SPACE_CONTENTS,
    THE_NOTE_SPACES,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveNoteFoldersEndpoints } from '../endpoints/note-folders.endpoints';
import { ApiNoteFoldersGateway } from './api-note-folders.gateway';

const FOLDER_ID = A_SHARED_FOLDER.folderId;
const NOTE_ID = A_SHARED_NOTE.noteId;
const SESSION_COOKIE = { Cookie: 'cocooning_session=session-token-1' };
const ACCEPT = { Accept: 'application/json' };
const JSON_BODY = { ...ACCEPT, 'Content-Type': 'application/json' };

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiNoteFoldersGateway(
        resolveNoteFoldersEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );
const anApiRefusal = (status: number, code: string) =>
    JSON.stringify({ status, code, message: 'Refused', context: null });

describe('Feature: the PWA reaches the spaces and folders of the notes through the API', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: R10, the partner reads the spaces and their contents', () => {
        it('lists the two spaces with the session cookie', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(THE_NOTE_SPACES));
            await expect(aGateway().listSpaces()).resolves.toEqual(
                ok(THE_NOTE_SPACES),
            );
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/note-spaces',
                    method: 'GET',
                    headers: { ...ACCEPT, ...SESSION_COOKIE },
                    body: null,
                },
            ]);
        });

        it('reads the root of a space without a folder in the query', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_SPACE_CONTENTS));
            await expect(
                aGateway().getSpaceContents(NoteSpaceEnum.SHARED, null),
            ).resolves.toEqual(ok(A_SPACE_CONTENTS));
            expect(fakeFetch.calls[0]?.url).toBe(
                'http://api.test/note-spaces/SHARED/contents',
            );
        });

        it('reads one folder of a space by its id in the query', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_SPACE_CONTENTS));
            await aGateway().getSpaceContents(NoteSpaceEnum.PRIVATE, FOLDER_ID);
            expect(fakeFetch.calls[0]?.url).toBe(
                `http://api.test/note-spaces/PRIVATE/contents?folderId=${FOLDER_ID}`,
            );
        });

        it('refuses an answer outside the contract', async () => {
            fakeFetch.givenResponse(200, JSON.stringify({ spaces: 'none' }));
            const result = await aGateway().listSpaces();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });
    });

    describe('Scenario: R13 to R16, the partner arranges the folders', () => {
        it('creates a folder with the trimmed name', async () => {
            fakeFetch.givenResponse(201, JSON.stringify(A_SHARED_FOLDER));
            await expect(
                aGateway().createFolder({
                    space: NoteSpaceEnum.SHARED,
                    parentFolderId: null,
                    name: ' Vacances ',
                }),
            ).resolves.toEqual(ok(A_SHARED_FOLDER));
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/note-folders',
                    method: 'POST',
                    headers: { ...JSON_BODY, ...SESSION_COOKIE },
                    body: JSON.stringify({
                        space: 'SHARED',
                        parentFolderId: null,
                        name: 'Vacances',
                    }),
                },
            ]);
        });

        it('renames and moves a folder', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_SHARED_FOLDER));
            await aGateway().renameFolder(FOLDER_ID, { name: 'Voyages' });
            await expect(
                aGateway().moveFolder(FOLDER_ID, { parentFolderId: null }),
            ).resolves.toEqual(ok(A_SHARED_FOLDER));
            expect(
                fakeFetch.calls.map(({ url, method, body }) => ({
                    url,
                    method,
                    body,
                })),
            ).toEqual([
                {
                    url: `http://api.test/note-folders/${FOLDER_ID}`,
                    method: 'PATCH',
                    body: JSON.stringify({ name: 'Voyages' }),
                },
                {
                    url: `http://api.test/note-folders/${FOLDER_ID}/move`,
                    method: 'POST',
                    body: JSON.stringify({ parentFolderId: null }),
                },
            ]);
        });

        it('deletes a folder from a 204 without body (R16)', async () => {
            fakeFetch.givenResponse(204, '');
            await expect(aGateway().deleteFolder(FOLDER_ID)).resolves.toEqual(
                ok(null),
            );
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test/note-folders/${FOLDER_ID}`,
                method: 'DELETE',
                body: null,
            });
        });

        it('moves a note into a folder of « Privé » (R11)', async () => {
            const moved = { ...A_SHARED_NOTE, folderId: FOLDER_ID };
            fakeFetch.givenResponse(200, JSON.stringify(moved));
            await expect(
                aGateway().moveNote(NOTE_ID, {
                    space: NoteSpaceEnum.PRIVATE,
                    folderId: FOLDER_ID,
                }),
            ).resolves.toEqual(ok(moved));
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test/notes/${NOTE_ID}/move`,
                method: 'POST',
                body: JSON.stringify({ space: 'PRIVATE', folderId: FOLDER_ID }),
            });
        });
    });

    describe('Scenario: the API refuses a folder action', () => {
        it.each([
            [
                404,
                NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                ApiErrorCodeEnum.NOT_FOUND,
            ],
            [
                422,
                NoteExceptionCodeEnum.FOLDER_NAME_INVALID,
                ApiErrorCodeEnum.VALIDATION_ERROR,
            ],
            [
                422,
                NoteExceptionCodeEnum.FOLDER_MOVE_INVALID,
                ApiErrorCodeEnum.VALIDATION_ERROR,
            ],
            [
                422,
                NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
                ApiErrorCodeEnum.VALIDATION_ERROR,
            ],
            [
                403,
                NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
                ApiErrorCodeEnum.FORBIDDEN,
            ],
            [
                409,
                NoteExceptionCodeEnum.FOLDER_VERSION_CONFLICT,
                ApiErrorCodeEnum.CONFLICT,
            ],
        ])('turns a %i %s into %s', async (status, backendCode, code) => {
            fakeFetch.givenResponse(status, anApiRefusal(status, backendCode));
            await expect(
                aGateway().moveFolder(FOLDER_ID, { parentFolderId: null }),
            ).resolves.toEqual(fail({ code, message: 'Refused', backendCode }));
        });

        it('passes the refusal of a deletion through', async () => {
            const code = NoteExceptionCodeEnum.FOLDER_NOT_FOUND;
            fakeFetch.givenResponse(404, anApiRefusal(404, code));
            const result = await aGateway().deleteFolder(FOLDER_ID);
            expect(result.success === false && result.error.backendCode).toBe(
                code,
            );
        });
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it.each([
            [
                'an empty folder name',
                () => aGateway().renameFolder(FOLDER_ID, { name: ' ' }),
            ],
            [
                'a parent that is not a folder id',
                () =>
                    aGateway().moveFolder(FOLDER_ID, {
                        parentFolderId: '../couple',
                    }),
            ],
            [
                'a destination folder that is not a folder id',
                () =>
                    aGateway().moveNote(NOTE_ID, {
                        space: NoteSpaceEnum.SHARED,
                        folderId: 'x',
                    }),
            ],
            [
                'a new folder without a name',
                () =>
                    aGateway().createFolder({
                        space: NoteSpaceEnum.SHARED,
                        parentFolderId: null,
                        name: '',
                    }),
            ],
        ])('refuses %s without calling the API', async (_label, call) => {
            const result = await call();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });

        it('refuses without calling the API when there is no session', async () => {
            const result = await aGateway(null).listSpaces();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
