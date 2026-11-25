import { FakeFetch } from '@cocooning/client-infrastructure/testing';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_PROPOSED_TEMPLATE,
    A_SMART_FOLDER,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createCoupleHttpConfig } from '../../couple-http-config';
import { resolveNoteFoldersEndpoints } from '../endpoints/note-folders.endpoints';
import { ApiNoteFoldersGateway } from './api-note-folders.gateway';

const FOLDER_ID = A_SMART_FOLDER.folderId;
const TEMPLATE = { subject: 'Les restaurants', cardTemplate: ['Prix'] };
const PROPOSAL_REQUEST = {
    space: NoteSpaceEnum.SHARED,
    parentFolderId: null,
    name: ' Restaurants ',
};

const aGateway = () =>
    new ApiNoteFoldersGateway(
        resolveNoteFoldersEndpoints('http://api.test'),
        createCoupleHttpConfig(5000),
        () => Promise.resolve('session-token-1'),
    );
const anApiRefusal = (status: number, code: string) =>
    JSON.stringify({ status, code, message: 'Refused', context: null });

describe('Feature: the PWA reaches the template of the smart folders through the API (R17)', () => {
    let fakeFetch: FakeFetch;

    beforeEach(() => {
        fakeFetch = new FakeFetch();
        fakeFetch.install();
    });
    afterEach(() => fakeFetch.restore());

    describe('Scenario: the partner asks for a proposal, then corrects the template', () => {
        it('asks for a proposal with the trimmed name and the session', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_PROPOSED_TEMPLATE));
            await expect(
                aGateway().proposeFolderTemplate(PROPOSAL_REQUEST),
            ).resolves.toEqual(ok(A_PROPOSED_TEMPLATE));
            expect(fakeFetch.calls).toEqual([
                {
                    url: 'http://api.test/note-folders/template-proposals',
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Cookie': 'cocooning_session=session-token-1',
                    },
                    body: JSON.stringify({
                        space: 'SHARED',
                        parentFolderId: null,
                        name: 'Restaurants',
                    }),
                },
            ]);
        });

        it('puts the corrected template of a folder', async () => {
            fakeFetch.givenResponse(200, JSON.stringify(A_SMART_FOLDER));
            await expect(
                aGateway().editFolderTemplate(FOLDER_ID, TEMPLATE),
            ).resolves.toEqual(ok(A_SMART_FOLDER));
            expect(fakeFetch.calls[0]).toMatchObject({
                url: `http://api.test/note-folders/${FOLDER_ID}/template`,
                method: 'PUT',
                body: JSON.stringify(TEMPLATE),
            });
        });

        it('refuses a proposal outside the contract', async () => {
            fakeFetch.givenResponse(200, JSON.stringify({ subject: 'S' }));
            const result =
                await aGateway().proposeFolderTemplate(PROPOSAL_REQUEST);
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.INVALID_RESPONSE,
            );
        });
    });

    describe('Scenario: the API refuses', () => {
        it.each([
            [
                422,
                NoteExceptionCodeEnum.FOLDER_TEMPLATE_INHERITED,
                ApiErrorCodeEnum.VALIDATION_ERROR,
            ],
            [
                422,
                NoteExceptionCodeEnum.FOLDER_NOT_SMART,
                ApiErrorCodeEnum.VALIDATION_ERROR,
            ],
            [
                404,
                NoteExceptionCodeEnum.FOLDER_NOT_FOUND,
                ApiErrorCodeEnum.NOT_FOUND,
            ],
            [
                503,
                NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
                ApiErrorCodeEnum.UNKNOWN,
            ],
        ])('turns a %i %s into %s', async (status, backendCode, code) => {
            fakeFetch.givenResponse(status, anApiRefusal(status, backendCode));
            await expect(
                aGateway().editFolderTemplate(FOLDER_ID, TEMPLATE),
            ).resolves.toEqual(fail({ code, message: 'Refused', backendCode }));
        });

        it.each([
            [
                'a template twice the same field',
                () =>
                    aGateway().editFolderTemplate(FOLDER_ID, {
                        subject: 'S',
                        cardTemplate: ['Prix', 'prix'],
                    }),
            ],
            [
                'a proposal without a name',
                () =>
                    aGateway().proposeFolderTemplate({
                        ...PROPOSAL_REQUEST,
                        name: ' ',
                    }),
            ],
        ])('refuses %s without calling the API', async (_label, call) => {
            const result = await call();
            expect(result.success === false && result.error.code).toBe(
                ApiErrorCodeEnum.VALIDATION_ERROR,
            );
            expect(fakeFetch.calls).toEqual([]);
        });
    });
});
