import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const CONTENT = Uint8Array.from([1, 2, 3]);

describe('Feature: the content of a note, edited in real time (R6, decision 0040)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const id = (note: { id: NoteId }) => ({ noteId: note.id.getValue() });

    describe('Scenario: R4, who may open the editor', () => {
        it('lets both partners open a shared note', async () => {
            const note = ctx.givenNoteOf(AS_A);
            const authorize = ctx.authorizeNoteDocumentUseCase();
            await expect(
                authorize.execute(AS_A, id(note)),
            ).resolves.toBeUndefined();
            await expect(
                authorize.execute(AS_B, id(note)),
            ).resolves.toBeUndefined();
        });

        it.each([
            ['the other partner on a private note', AS_B],
            ['another couple', AS_STRANGER],
        ])(
            'refuses %s, as if the note did not exist',
            async (_label, context) => {
                const note = ctx.givenPrivateNoteOf(AS_A);
                await expect(
                    ctx
                        .authorizeNoteDocumentUseCase()
                        .execute(context, id(note)),
                ).rejects.toMatchObject({
                    code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
                });
            },
        );
    });

    describe('Scenario: R6, the content written by one is read by the other', () => {
        it('gives nothing before the first edit, then the saved state', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(
                ctx.loadNoteDocumentUseCase().execute(AS_B, id(note)),
            ).resolves.toBeNull();
            await ctx
                .saveNoteDocumentUseCase()
                .execute(AS_A, { ...id(note), content: CONTENT });
            await expect(
                ctx.loadNoteDocumentUseCase().execute(AS_B, id(note)),
            ).resolves.toEqual(CONTENT);
        });

        it('refuses to load the private note of the other', async () => {
            const note = ctx.givenPrivateNoteOf(AS_A);
            await expect(
                ctx.loadNoteDocumentUseCase().execute(AS_B, id(note)),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R28, each save counts the lines left to check', () => {
        it('reads the saved content and keeps its count, which a later save of the note does not undo', async () => {
            const list = ctx.givenListOf(AS_A);
            ctx.noteChecklistReader.willCount(2);
            await ctx
                .saveNoteDocumentUseCase()
                .execute(AS_B, { ...id(list), content: CONTENT });
            expect(ctx.noteChecklistReader.requests).toEqual([
                { noteId: list.id.getValue(), content: CONTENT },
            ]);
            await ctx.renameNoteUseCase().execute(AS_A, {
                ...id(list),
                title: 'Lidl',
            });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                title: 'Lidl',
                openItemCount: 2,
                version: 2,
            });
        });

        it('counts an ordinary note too, whose count no screen shows', async () => {
            const note = ctx.givenNoteOf(AS_A);
            ctx.noteChecklistReader.willCount(1);
            await ctx
                .saveNoteDocumentUseCase()
                .execute(AS_A, { ...id(note), content: CONTENT });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                listKind: null,
                openItemCount: 1,
            });
        });

        it('writes no count for a note of another couple', async () => {
            const note = ctx.givenNoteOf(AS_A);
            ctx.noteChecklistReader.willCount(4);
            await ctx
                .saveNoteDocumentUseCase()
                .execute(AS_STRANGER, { ...id(note), content: CONTENT });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                openItemCount: 0,
            });
        });
    });

    describe('Scenario: R7, the channel stores after a deletion', () => {
        it('keeps no content for a deleted note', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await ctx.deleteNoteUseCase().execute(AS_A, id(note));
            await ctx
                .saveNoteDocumentUseCase()
                .execute(AS_A, { ...id(note), content: CONTENT });
            await expect(
                ctx.noteContentRepository.findContent(
                    AS_A.coupleId,
                    note.id.getValue(),
                ),
            ).resolves.toBeNull();
        });
    });
});
