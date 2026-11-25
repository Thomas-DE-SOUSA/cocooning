import { ProposeFolderTemplateUseCase } from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_PROPOSED_TEMPLATE,
    FakeNoteFoldersGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { proposeFolderTemplate } from './folder-template-commands.service';

const SHARED_ROOT = { space: NoteSpaceEnum.SHARED, folderId: null };

describe('Feature: the card template of a smart folder, from the server actions', () => {
    let gateway: FakeNoteFoldersGateway;

    beforeEach(() => {
        gateway = new FakeNoteFoldersGateway();
    });

    describe('Scenario: R17, the AI proposes a subject and fields from the name', () => {
        const propose = (input: unknown, destination: unknown = SHARED_ROOT) =>
            proposeFolderTemplate(input, destination, {
                t: (key) => key,
                proposeFolderTemplate: new ProposeFolderTemplateUseCase(
                    gateway,
                ),
            });

        it('sends the trimmed name and the place, and gives the proposal', async () => {
            expect(await propose({ name: ' Restaurants ' })).toEqual(
                ok(A_PROPOSED_TEMPLATE),
            );
            expect(gateway.calls).toEqual([
                {
                    operation: 'proposeFolderTemplate',
                    request: {
                        space: NoteSpaceEnum.SHARED,
                        parentFolderId: null,
                        name: 'Restaurants',
                    },
                },
            ]);
        });

        it.each([
            ['an empty name', { name: ' ' }, SHARED_ROOT],
            ['an unknown space', { name: 'Restos' }, { space: 'X' }],
        ])(
            'refuses %s without calling the API',
            async (_label, input, destination) => {
                const result = await propose(input, destination);
                expect(result.success === false && result.error.code).toBe(
                    ApiErrorCodeEnum.VALIDATION_ERROR,
                );
                expect(gateway.calls).toEqual([]);
            },
        );

        it('passes the AI unavailable through', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.UNKNOWN,
                message: 'Unavailable',
                backendCode: NoteExceptionCodeEnum.NOTE_CARD_WRITER_UNAVAILABLE,
            };
            gateway.givenRefusal(refusal);

            expect(await propose({ name: 'Restos' })).toEqual(fail(refusal));
        });
    });
});
