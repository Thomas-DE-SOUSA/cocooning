import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: list the notes of the couple', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const FIRST_PAGE = { page: 1, pageSize: 25 };

    const titlesSeenBy = async (context: typeof AS_A) =>
        (await ctx.listNotesUseCase().execute(context, FIRST_PAGE)).items.map(
            ({ title }) => title,
        );

    it('shows the shared notes of both and the own private notes, most recent first (R4)', async () => {
        ctx.givenNoteOf(AS_A, 'Courses');
        ctx.advanceHours(1);
        ctx.givenPrivateNoteOf(AS_A, 'Idées cadeaux');
        ctx.advanceHours(1);
        ctx.givenNoteOf(AS_B, 'Vacances');

        expect(await titlesSeenBy(AS_A)).toEqual([
            'Vacances',
            'Idées cadeaux',
            'Courses',
        ]);
        expect(await titlesSeenBy(AS_B)).toEqual(['Vacances', 'Courses']);
    });

    it('hides a deleted note', async () => {
        const note = ctx.givenNoteOf(AS_A);
        note.delete(AS_A.userId, ctx.dateTimeProvider.now());
        ctx.noteRepository.seed(note);
        expect(await titlesSeenBy(AS_A)).toEqual([]);
    });

    it('shows nothing of the couple to another couple (core.md rule 27)', async () => {
        ctx.givenNoteOf(AS_A);
        expect(await titlesSeenBy(AS_STRANGER)).toEqual([]);
    });

    it('gives each note its owner and visibility', async () => {
        const note = ctx.givenNoteOf(AS_A);
        await expect(
            ctx.listNotesUseCase().execute(AS_B, FIRST_PAGE),
        ).resolves.toEqual({
            items: [
                {
                    noteId: note.id.getValue(),
                    ownerId: AS_A.userId,
                    isOwner: false,
                    title: 'Courses',
                    visibility: NoteVisibilityEnum.SHARED,
                    folderId: null,
                    updatedAt: ctx.dateTimeProvider.now(),
                },
            ],
            total: 1,
            page: 1,
            pageSize: 25,
        });
    });

    it('tells the owner which notes are hers (R5, R7)', async () => {
        ctx.givenNoteOf(AS_A);
        const page = await ctx.listNotesUseCase().execute(AS_A, FIRST_PAGE);
        expect(page.items.map((item) => item.isOwner)).toEqual([true]);
    });

    it('gives one page and the total of visible notes (decision 0025)', async () => {
        ctx.givenNoteOf(AS_A, 'Un');
        ctx.advanceHours(1);
        ctx.givenNoteOf(AS_A, 'Deux');
        ctx.advanceHours(1);
        ctx.givenNoteOf(AS_A, 'Trois');
        const page = await ctx
            .listNotesUseCase()
            .execute(AS_A, { page: 2, pageSize: 2 });
        expect(page).toMatchObject({ total: 3, page: 2, pageSize: 2 });
        expect(page.items.map(({ title }) => title)).toEqual(['Un']);
    });
});
