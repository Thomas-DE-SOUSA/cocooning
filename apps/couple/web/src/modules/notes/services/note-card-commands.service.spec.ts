import { AddNoteCardUseCase } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SMART_FOLDER,
    FakeNoteCardsGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { addNoteCard } from './note-card-commands.service';

const FOLDER_ID = A_SMART_FOLDER.folderId;

describe('Feature: card commands sent by the server actions', () => {
    let gateway: FakeNoteCardsGateway;

    beforeEach(() => {
        gateway = new FakeNoteCardsGateway();
    });

    describe('Scenario: R19, a partner adds an item to a smart folder', () => {
        const add = (folderId: unknown, input: unknown) =>
            addNoteCard(folderId, input, {
                t: (key) => key,
                addNoteCard: new AddNoteCardUseCase(gateway),
            });

        it('sends the trimmed name to the folder once', async () => {
            expect(await add(FOLDER_ID, { name: ' Chez Paul ' })).toEqual(
                ok(null),
            );
            expect(gateway.calls).toEqual([
                {
                    operation: 'addNoteCard',
                    folderId: FOLDER_ID,
                    request: { name: 'Chez Paul' },
                },
            ]);
        });

        it.each([
            ['an empty name', FOLDER_ID, { name: ' ' }],
            ['an id that is not a folder id', 'restos', { name: 'Chez Paul' }],
        ])(
            'refuses %s without calling the API',
            async (_label, folderId, input) => {
                const result = await add(folderId, input);
                expect(result.success === false && result.error.code).toBe(
                    ApiErrorCodeEnum.VALIDATION_ERROR,
                );
                expect(gateway.calls).toEqual([]);
            },
        );

        it('passes the refusal of the API through', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.VALIDATION_ERROR,
                message: 'Not smart',
                backendCode: NoteExceptionCodeEnum.FOLDER_NOT_SMART,
            };
            gateway.givenRefusal(refusal);

            expect(await add(FOLDER_ID, { name: 'Chez Paul' })).toEqual(
                fail(refusal),
            );
        });
    });
});
