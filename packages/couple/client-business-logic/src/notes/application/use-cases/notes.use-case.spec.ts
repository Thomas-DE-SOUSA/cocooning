import { ApiErrorCodeEnum } from '../../../shared/api-error';
import { fail, ok } from '@cocooning/shared-kernel/utils';
import {
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import {
    A_NOTE_PAGE,
    A_SHARED_NOTE,
    FakeNotesGateway,
} from '../../../testing/fake-notes.gateway';
import { CreateNoteUseCase } from './create-note.use-case';
import { DeleteNoteUseCase } from './delete-note.use-case';
import { GetNoteUseCase } from './get-note.use-case';
import { ListNotesUseCase } from './list-notes.use-case';
import { MakeNotePrivateUseCase } from './make-note-private.use-case';
import { RenameNoteUseCase } from './rename-note.use-case';
import { ShareNoteUseCase } from './share-note.use-case';

const NOTE_ID = A_SHARED_NOTE.noteId;
const FOLDER_ID = '01936b2e-7c4a-7000-8000-0000000000e1';
const RESERVED = {
    code: ApiErrorCodeEnum.FORBIDDEN,
    message: 'Reserved to the owner of the note',
    backendCode: 'NOTE_RESERVED_TO_OWNER',
};

describe('Feature: the notes of the couple from the PWA', () => {
    let gateway: FakeNotesGateway;

    beforeEach(() => {
        gateway = new FakeNotesGateway();
    });

    it('lists one page of notes (R4, decision 0025)', async () => {
        const query = { page: 2, pageSize: 10 };
        await expect(
            new ListNotesUseCase(gateway).execute(query),
        ).resolves.toEqual(ok(A_NOTE_PAGE));
        expect(gateway.calls).toEqual([{ operation: 'listNotes', query }]);
    });

    it('opens one note (R4)', async () => {
        await expect(
            new GetNoteUseCase(gateway).execute(NOTE_ID),
        ).resolves.toEqual(ok(A_SHARED_NOTE));
        expect(gateway.calls).toEqual([
            { operation: 'getNote', noteId: NOTE_ID },
        ]);
    });

    it.each([
        ['the root of « Partagé » (R2)', NoteSpaceEnum.SHARED, null],
        ['a folder of « Privé » (R11, R13)', NoteSpaceEnum.PRIVATE, FOLDER_ID],
    ])(
        'creates a note with its title in %s',
        async (_label, space, folderId) => {
            await expect(
                new CreateNoteUseCase(gateway).execute(
                    { title: 'Courses' },
                    { space, folderId },
                ),
            ).resolves.toEqual(ok(A_SHARED_NOTE));
            expect(gateway.calls).toEqual([
                {
                    operation: 'createNote',
                    request: { title: 'Courses', space, folderId },
                },
            ]);
        },
    );

    it('renames a note (R6)', async () => {
        const renamed = await new RenameNoteUseCase(gateway).execute(NOTE_ID, {
            title: 'Courses du samedi',
        });
        expect(renamed).toEqual(
            ok({ ...A_SHARED_NOTE, title: 'Courses du samedi' }),
        );
    });

    it('shares, makes private and deletes a note (R5, R7)', async () => {
        await new ShareNoteUseCase(gateway).execute(NOTE_ID);
        const madePrivate = await new MakeNotePrivateUseCase(gateway).execute(
            NOTE_ID,
        );
        await expect(
            new DeleteNoteUseCase(gateway).execute(NOTE_ID),
        ).resolves.toEqual(ok(null));
        expect(madePrivate).toEqual(
            ok({ ...A_SHARED_NOTE, visibility: NoteVisibilityEnum.PRIVATE }),
        );
        expect(gateway.calls.map(({ operation }) => operation)).toEqual([
            'shareNote',
            'makeNotePrivate',
            'deleteNote',
        ]);
    });

    it('returns the refusal of the API unchanged', async () => {
        gateway.givenRefusal(RESERVED);
        await expect(
            new DeleteNoteUseCase(gateway).execute(NOTE_ID),
        ).resolves.toEqual(fail(RESERVED));
    });
});
