import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { A_SHARED_NOTE } from '../../../testing/fake-notes.gateway';
import { FakeNoteFoldersGateway } from '../../../testing/fake-note-folders.gateway';
import {
    A_SHARED_FOLDER,
    A_SPACE_CONTENTS,
    THE_NOTE_SPACES,
} from '../../../testing/note-folders-fixtures';
import { CreateFolderUseCase } from './create-folder.use-case';
import { DeleteFolderUseCase } from './delete-folder.use-case';
import { GetNoteSpaceContentsUseCase } from './get-note-space-contents.use-case';
import { ListNoteSpacesUseCase } from './list-note-spaces.use-case';
import { MoveFolderUseCase } from './move-folder.use-case';
import { MoveNoteUseCase } from './move-note.use-case';
import { RenameFolderUseCase } from './rename-folder.use-case';

const FOLDER_ID = A_SHARED_FOLDER.folderId;
const PARENT_ID = '01936b2e-7c4a-7000-8000-0000000000e2';
const NOT_FOUND = {
    code: ApiErrorCodeEnum.NOT_FOUND,
    message: 'Folder not found',
    backendCode: 'FOLDER_NOT_FOUND',
};

describe('Feature: the spaces and folders of the notes from the PWA', () => {
    let gateway: FakeNoteFoldersGateway;

    beforeEach(() => {
        gateway = new FakeNoteFoldersGateway();
    });

    it('lists « Partagé » and « Privé » (R10)', async () => {
        await expect(
            new ListNoteSpacesUseCase(gateway).execute(),
        ).resolves.toEqual(ok(THE_NOTE_SPACES));
        expect(gateway.calls).toEqual([{ operation: 'listSpaces' }]);
    });

    it('opens the root of a space, then one of its folders (R10, R14)', async () => {
        const contents = new GetNoteSpaceContentsUseCase(gateway);
        await expect(
            contents.execute(NoteSpaceEnum.SHARED, null),
        ).resolves.toEqual(ok(A_SPACE_CONTENTS));
        await contents.execute(NoteSpaceEnum.SHARED, FOLDER_ID);
        expect(gateway.calls).toEqual([
            { operation: 'getSpaceContents', space: 'SHARED', folderId: null },
            {
                operation: 'getSpaceContents',
                space: 'SHARED',
                folderId: FOLDER_ID,
            },
        ]);
    });

    it('creates a folder with its name in a folder of « Privé » (R13)', async () => {
        const created = await new CreateFolderUseCase(gateway).execute(
            { name: 'Cadeaux' },
            { space: NoteSpaceEnum.PRIVATE, parentFolderId: PARENT_ID },
        );
        const request = {
            space: NoteSpaceEnum.PRIVATE,
            parentFolderId: PARENT_ID,
            name: 'Cadeaux',
            kind: 'CLASSIC',
            subject: null,
            cardTemplate: null,
        };
        expect(created).toEqual(ok({ ...A_SHARED_FOLDER, ...request }));
        expect(gateway.calls).toEqual([{ operation: 'createFolder', request }]);
    });

    it('renames and moves a folder (R14, R15)', async () => {
        await expect(
            new RenameFolderUseCase(gateway).execute(FOLDER_ID, {
                name: 'Voyages',
            }),
        ).resolves.toEqual(ok({ ...A_SHARED_FOLDER, name: 'Voyages' }));
        await expect(
            new MoveFolderUseCase(gateway).execute(FOLDER_ID, PARENT_ID),
        ).resolves.toEqual(
            ok({ ...A_SHARED_FOLDER, parentFolderId: PARENT_ID }),
        );
        expect(gateway.calls).toEqual([
            {
                operation: 'renameFolder',
                folderId: FOLDER_ID,
                request: { name: 'Voyages' },
            },
            {
                operation: 'moveFolder',
                folderId: FOLDER_ID,
                request: { parentFolderId: PARENT_ID },
            },
        ]);
    });

    it('deletes a folder (R16)', async () => {
        await expect(
            new DeleteFolderUseCase(gateway).execute(FOLDER_ID),
        ).resolves.toEqual(ok(null));
        expect(gateway.calls).toEqual([
            { operation: 'deleteFolder', folderId: FOLDER_ID },
        ]);
    });

    it('moves a note into a folder of « Privé » (R11)', async () => {
        const destination = {
            space: NoteSpaceEnum.PRIVATE,
            folderId: PARENT_ID,
        };
        const moved = await new MoveNoteUseCase(gateway).execute(
            A_SHARED_NOTE.noteId,
            destination,
        );
        expect(moved.success && moved.value.folderId).toBe(PARENT_ID);
        expect(gateway.calls).toEqual([
            {
                operation: 'moveNote',
                noteId: A_SHARED_NOTE.noteId,
                request: destination,
            },
        ]);
    });

    it('returns the refusal of the API unchanged', async () => {
        gateway.givenRefusal(NOT_FOUND);
        await expect(
            new DeleteFolderUseCase(gateway).execute(FOLDER_ID),
        ).resolves.toEqual(fail(NOT_FOUND));
    });
});
