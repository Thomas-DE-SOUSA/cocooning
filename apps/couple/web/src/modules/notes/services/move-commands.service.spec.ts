import {
    MoveFolderUseCase,
    MoveNoteUseCase,
} from '@cocooning/couple-client-business-logic/notes';
import {
    type ApiError,
    ApiErrorCodeEnum,
} from '@cocooning/couple-client-business-logic/shared';
import {
    A_SHARED_FOLDER,
    A_SHARED_NOTE,
    FakeNoteFoldersGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { moveFolder, moveNote } from './move-commands.service';

const PARENT_ID = '01936b2e-7c4a-7000-8000-0000000000e2';

describe('Feature: moves sent by the server actions', () => {
    let gateway: FakeNoteFoldersGateway;

    beforeEach(() => {
        gateway = new FakeNoteFoldersGateway();
    });

    describe('Scenario: R11, a partner moves a note', () => {
        const move = (noteId: unknown, destination: unknown) =>
            moveNote(noteId, destination, new MoveNoteUseCase(gateway));

        it('sends the note to the space and the folder chosen', async () => {
            const destination = {
                space: NoteSpaceEnum.PRIVATE,
                folderId: PARENT_ID,
            };

            expect(await move(A_SHARED_NOTE.noteId, destination)).toEqual(
                ok(null),
            );
            expect(gateway.calls).toEqual([
                {
                    operation: 'moveNote',
                    noteId: A_SHARED_NOTE.noteId,
                    request: destination,
                },
            ]);
        });

        it('passes the refusal of the other partner note in « Privé » through', async () => {
            const refusal: ApiError = {
                code: ApiErrorCodeEnum.FORBIDDEN,
                message: 'Reserved to owner',
                backendCode: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
            };
            gateway.givenRefusal(refusal);

            expect(
                await move(A_SHARED_NOTE.noteId, {
                    space: NoteSpaceEnum.PRIVATE,
                    folderId: null,
                }),
            ).toEqual(fail(refusal));
        });

        it.each([
            [
                'an unknown space',
                A_SHARED_NOTE.noteId,
                { space: 'X', folderId: null },
            ],
            [
                'an id that is not a note id',
                '../couple',
                { space: NoteSpaceEnum.SHARED, folderId: null },
            ],
        ])(
            'refuses %s without calling the API',
            async (_label, noteId, destination) => {
                const result = await move(noteId, destination);
                expect(result.success === false && result.error.code).toBe(
                    ApiErrorCodeEnum.VALIDATION_ERROR,
                );
                expect(gateway.calls).toEqual([]);
            },
        );
    });

    describe('Scenario: R15, a partner moves a folder within its space', () => {
        const move = (folderId: unknown, parent: unknown) =>
            moveFolder(folderId, parent, new MoveFolderUseCase(gateway));

        it.each([
            ['into another folder', PARENT_ID],
            ['to the root of its space', null],
        ])('sends the folder %s', async (_label, parentFolderId) => {
            expect(
                await move(A_SHARED_FOLDER.folderId, parentFolderId),
            ).toEqual(ok(null));
            expect(gateway.calls).toEqual([
                {
                    operation: 'moveFolder',
                    folderId: A_SHARED_FOLDER.folderId,
                    request: { parentFolderId },
                },
            ]);
        });

        it.each([
            ['a parent that is not a folder id', A_SHARED_FOLDER.folderId, 'x'],
            ['an id that is not a folder id', 'maison', null],
        ])(
            'refuses %s without calling the API',
            async (_label, folderId, parent) => {
                const result = await move(folderId, parent);
                expect(result.success === false && result.error.code).toBe(
                    ApiErrorCodeEnum.VALIDATION_ERROR,
                );
                expect(gateway.calls).toEqual([]);
            },
        );
    });
});
