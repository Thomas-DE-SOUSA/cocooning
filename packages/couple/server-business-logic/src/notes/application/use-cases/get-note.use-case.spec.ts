import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

describe('Feature: open one note', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const open = (context: typeof AS_A, note: { id: NoteId }) =>
        ctx.getNoteUseCase().execute(context, { noteId: note.id.getValue() });

    describe('Scenario: R4, a note the partner sees', () => {
        it('gives the note to the other partner, who does not own it', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(open(AS_B, note)).resolves.toEqual({
                noteId: note.id.getValue(),
                ownerId: AS_A.userId,
                isOwner: false,
                title: 'Courses',
                visibility: NoteVisibilityEnum.SHARED,
                updatedAt: ctx.dateTimeProvider.now(),
            });
        });

        it('gives her private note to the owner', async () => {
            const note = ctx.givenPrivateNoteOf(AS_A);
            const view = await open(AS_A, note);
            expect(view.isOwner).toBe(true);
            expect(view.visibility).toBe(NoteVisibilityEnum.PRIVATE);
        });
    });

    describe('Scenario: R4, a note the partner does not see', () => {
        it.each([
            ['the other partner on a private note', AS_B],
            ['another couple', AS_STRANGER],
        ])(
            'refuses %s, as if the note did not exist',
            async (_label, context) => {
                const note = ctx.givenPrivateNoteOf(AS_A);
                await expect(open(context, note)).rejects.toMatchObject({
                    code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
                });
            },
        );
    });
});
