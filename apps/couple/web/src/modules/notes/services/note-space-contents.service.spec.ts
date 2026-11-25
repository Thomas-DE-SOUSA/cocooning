import { GetNoteSpaceContentsUseCase } from '@cocooning/couple-client-business-logic/notes';
import { ApiErrorCodeEnum } from '@cocooning/couple-client-business-logic/shared';
import {
    A_SPACE_CONTENTS,
    FakeNoteFoldersGateway,
} from '@cocooning/couple-client-business-logic/testing';
import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { ok } from '@cocooning/shared-kernel/utils';
import { readNoteSpaceContents } from './note-space-contents.service';

const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e1';

describe('Feature: a place read for the move picker (R10)', () => {
    it('reads the folder of the space asked', async () => {
        const gateway = new FakeNoteFoldersGateway();

        const contents = await readNoteSpaceContents(
            { space: NoteSpaceEnum.PRIVATE, folderId: FOLDER_ID },
            new GetNoteSpaceContentsUseCase(gateway),
        );

        expect(contents).toEqual(
            ok({ ...A_SPACE_CONTENTS, space: NoteSpaceEnum.PRIVATE }),
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'getSpaceContents',
                space: NoteSpaceEnum.PRIVATE,
                folderId: FOLDER_ID,
            },
        ]);
    });

    it.each([
        ['an unknown space', { space: 'BOTH', folderId: null }],
        ['a folder id that is not one', { space: 'SHARED', folderId: 'x' }],
        ['no place', null],
    ])('refuses %s without calling the API', async (_label, location) => {
        const gateway = new FakeNoteFoldersGateway();

        const contents = await readNoteSpaceContents(
            location,
            new GetNoteSpaceContentsUseCase(gateway),
        );

        expect(contents.success === false && contents.error.code).toBe(
            ApiErrorCodeEnum.VALIDATION_ERROR,
        );
        expect(gateway.calls).toEqual([]);
    });
});
