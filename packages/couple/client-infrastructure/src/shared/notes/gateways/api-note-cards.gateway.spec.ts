import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_CHOOSING_NOTE_CARD,
    A_FILLED_NOTE_CARD,
    A_SHARED_NOTE,
    A_SMART_FOLDER,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveNoteCardsEndpoints } from '../endpoints/note-cards.endpoints';
import { ApiNoteCardsGateway } from './api-note-cards.gateway';

const FOLDER_ID = A_SMART_FOLDER.folderId;
const NOTE_ID = A_CHOOSING_NOTE_CARD.noteId;
const CARD_NOTE = {
    ...A_SHARED_NOTE,
    folderId: FOLDER_ID,
    card: A_FILLED_NOTE_CARD,
};
const NOTE_URL = `http://api.test/notes/${NOTE_ID}/card`;
const {
    NOTE_CARD_NOT_FOUND,
    NOTE_CARD_STATUS_INVALID,
    NOTE_CARD_VERSION_CONFLICT,
    NOTE_CARD_CANDIDATE_INVALID,
    NOTE_CARD_FIELD_INVALID,
    FOLDER_NOT_SMART,
    NOTE_CARD_SEARCH_UNAVAILABLE,
    NOTE_CARD_WRITER_UNAVAILABLE,
} = NoteExceptionCodeEnum;
const { NOT_FOUND, CONFLICT, VALIDATION_ERROR, UNKNOWN } = ApiErrorCodeEnum;

const aGateway = (token: string | null = 'session-token-1') =>
    new ApiNoteCardsGateway(
        resolveNoteCardsEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve(token),
    );
const anApiRefusal = (status: number, code: string) =>
    JSON.stringify({ status, code, message: 'Refused', context: null });

describe('Feature: the PWA reaches the note cards through the API (R19 to R22)', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: R19, R20, the partner adds a note by its name', () => {
        it('posts the trimmed name with the session and reads the note and its card', async () => {
            fakeFetch.givenResponse(201, JSON.stringify(CARD_NOTE));
            await expect(
                aGateway().addNoteCard(FOLDER_ID, { name: ' Chez Paul ' }),
            ).resolves.toEqual(ok(CARD_NOTE));
            expect(fakeFetch.calls).toEqual([
                {
                    url: `http://api.test/note-folders/${FOLDER_ID}/cards`,
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Cookie': 'cocooning_session=session-token-1',
                    },
                    body: JSON.stringify({ name: 'Chez Paul' }),
                },
            ]);
        });

        it('refuses a note without its card field in the answer', async () => {
            const withoutCard = { ...A_SHARED_NOTE, folderId: FOLDER_ID };
            fakeFetch.givenResponse(201, JSON.stringify(withoutCard));
            const result = await aGateway().addNoteCard(FOLDER_ID, {
                name: 'Chez Paul',
            });
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });
    });

    describe('Scenario: R19, R22, the partner acts on a card', () => {
        it('chooses, refines, refreshes and corrects, each on its route', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_FILLED_NOTE_CARD));
            const gateway = aGateway();
            await expect(
                gateway.chooseNoteCardCandidate(NOTE_ID, { candidateIndex: 1 }),
            ).resolves.toEqual(ok(A_FILLED_NOTE_CARD));
            await gateway.refineNoteCard(NOTE_ID, { query: ' Lyon ' });
            await gateway.refreshNoteCard(NOTE_ID);
            await gateway.correctNoteCardField(NOTE_ID, {
                name: 'Prix',
                value: ' 25 € ',
            });
            expect(
                fakeFetch.calls.map(({ url, method, body }) => ({
                    url,
                    method,
                    body,
                })),
            ).toEqual([
                {
                    url: `${NOTE_URL}/choose`,
                    method: 'POST',
                    body: JSON.stringify({ candidateIndex: 1 }),
                },
                {
                    url: `${NOTE_URL}/refine`,
                    method: 'POST',
                    body: JSON.stringify({ query: 'Lyon' }),
                },
                { url: `${NOTE_URL}/refresh`, method: 'POST', body: null },
                {
                    url: `${NOTE_URL}/fields`,
                    method: 'PUT',
                    body: JSON.stringify({ name: 'Prix', value: '25 €' }),
                },
            ]);
        });

        it('refuses a card outside the contract', async () => {
            fakeFetch.givenResponse(200, JSON.stringify({ status: 'LOST' }));
            const result = await aGateway().refreshNoteCard(NOTE_ID);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });
    });

    describe('Scenario: the API refuses a card action', () => {
        it.each([
            [404, NOTE_CARD_NOT_FOUND, NOT_FOUND],
            [409, NOTE_CARD_STATUS_INVALID, CONFLICT],
            [409, NOTE_CARD_VERSION_CONFLICT, CONFLICT],
            [422, NOTE_CARD_CANDIDATE_INVALID, VALIDATION_ERROR],
            [422, NOTE_CARD_FIELD_INVALID, VALIDATION_ERROR],
            [422, FOLDER_NOT_SMART, VALIDATION_ERROR],
            [503, NOTE_CARD_SEARCH_UNAVAILABLE, UNKNOWN],
            [503, NOTE_CARD_WRITER_UNAVAILABLE, UNKNOWN],
        ])('turns a %i %s into %s', async (status, backendCode, code) => {
            fakeFetch.givenResponse(status, anApiRefusal(status, backendCode));
            await expect(aGateway().refreshNoteCard(NOTE_ID)).resolves.toEqual(
                fail({ code, message: 'Refused', backendCode }),
            );
        });
    });

    describe('Scenario: a request outside the contract or without session', () => {
        it.each([
            [
                'an empty name',
                () => aGateway().addNoteCard(FOLDER_ID, { name: ' ' }),
            ],
            [
                'a fourth candidate',
                () =>
                    aGateway().chooseNoteCardCandidate(NOTE_ID, {
                        candidateIndex: 3,
                    }),
            ],
            [
                'an empty query',
                () => aGateway().refineNoteCard(NOTE_ID, { query: '' }),
            ],
            [
                'an empty value',
                () =>
                    aGateway().correctNoteCardField(NOTE_ID, {
                        name: 'Prix',
                        value: ' ',
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
            const result = await aGateway(null).refreshNoteCard(NOTE_ID);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.UNAUTHORIZED,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
