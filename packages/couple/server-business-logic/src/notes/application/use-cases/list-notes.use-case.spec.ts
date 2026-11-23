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

    const titlesSeenBy = async (context: typeof AS_A) =>
        (await ctx.listNotesUseCase().execute(context)).map(
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
        const [view] = await ctx.listNotesUseCase().execute(AS_B);
        expect(view).toEqual({
            noteId: note.id.getValue(),
            ownerId: AS_A.userId,
            title: 'Courses',
            visibility: NoteVisibilityEnum.SHARED,
            updatedAt: ctx.dateTimeProvider.now(),
        });
    });
});
