import { NoteSpaceEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: the two spaces of the notes (R10)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const spacesOf = (context: typeof AS_A) =>
        ctx.listNoteSpacesUseCase().execute(context);

    beforeEach(() => {
        const restaurants = ctx.givenFolderOf(AS_A, 'Restaurants');
        ctx.givenFolderOf(AS_B, 'Italiens', restaurants);
        ctx.givenNoteOf(AS_B, 'Chez Luigi', restaurants);
        ctx.givenNoteOf(AS_A, 'Courses');
        ctx.givenPrivateFolderOf(AS_A, 'Cadeaux');
        ctx.givenPrivateNoteOf(AS_A, 'Idées cadeaux');
    });

    it('counts, in « Partagé » then « Privé », every folder and note the partner sees', async () => {
        await expect(spacesOf(AS_A)).resolves.toEqual({
            spaces: [
                { space: NoteSpaceEnum.SHARED, folderCount: 2, noteCount: 2 },
                { space: NoteSpaceEnum.PRIVATE, folderCount: 1, noteCount: 1 },
            ],
        });
    });

    it('never counts the private content of the other partner', async () => {
        await expect(spacesOf(AS_B)).resolves.toEqual({
            spaces: [
                { space: NoteSpaceEnum.SHARED, folderCount: 2, noteCount: 2 },
                { space: NoteSpaceEnum.PRIVATE, folderCount: 0, noteCount: 0 },
            ],
        });
    });

    it('shows nothing of the couple to another couple (core.md rule 27)', async () => {
        await expect(spacesOf(AS_STRANGER)).resolves.toEqual({
            spaces: [
                { space: NoteSpaceEnum.SHARED, folderCount: 0, noteCount: 0 },
                { space: NoteSpaceEnum.PRIVATE, folderCount: 0, noteCount: 0 },
            ],
        });
    });
});
