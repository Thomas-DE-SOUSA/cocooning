import {
    CreateFolderUseCase,
    type FolderNameForm,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import { FakeNoteFoldersGateway } from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { createFolder } from './folder-commands.service';

const IN_A_FOLDER = {
    space: NoteSpaceEnum.SHARED,
    folderId: '01936b2e-7c4a-7000-8000-0000000000e1',
};

describe('Feature: folder commands sent by the server actions', () => {
    let gateway: FakeNoteFoldersGateway;

    beforeEach(() => {
        gateway = new FakeNoteFoldersGateway();
    });

    describe('Scenario: R13, a partner creates a folder where she is', () => {
        const create = (input: unknown, destination: unknown = IN_A_FOLDER) =>
            createFolder(input, destination, {
                t: (key) => key,
                createFolder: new CreateFolderUseCase(gateway),
            });

        it('sends the trimmed name once, in the space and under the folder', async () => {
            const form: FolderNameForm = { name: ' Maison ' };

            expect(await create(form)).toEqual(ok(null));
            expect(gateway.calls).toEqual([
                {
                    operation: 'createFolder',
                    request: {
                        space: NoteSpaceEnum.SHARED,
                        parentFolderId: IN_A_FOLDER.folderId,
                        name: 'Maison',
                    },
                },
            ]);
        });

        it.each([
            ['an empty name', { name: '  ' }, IN_A_FOLDER],
            [
                'an unknown space',
                { name: 'Maison' },
                { space: 'X', folderId: null },
            ],
        ])(
            'refuses %s without calling the API (rule 14)',
            async (_label, input, destination) => {
                const result = await create(input, destination);
                expect(result.success === false && result.error.code).toBe(
                    ApiErrorCodeEnum.VALIDATION_ERROR,
                );
                expect(gateway.calls).toEqual([]);
            },
        );

        it('passes the refusal of the API through', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.VALIDATION_ERROR,
                message: 'Folder of another space',
                backendCode: NoteExceptionCodeEnum.FOLDER_SPACE_MISMATCH,
            };
            gateway.givenRefusal(refusal);

            expect(await create({ name: 'Maison' })).toEqual(fail(refusal));
        });
    });
});
