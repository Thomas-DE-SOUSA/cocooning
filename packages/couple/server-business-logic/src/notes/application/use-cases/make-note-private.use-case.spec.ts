import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteMadePrivateEvent } from '../../domain/events/note-made-private.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const CHANGED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: make a note private', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const run = (context: typeof AS_A, noteId: string) =>
        ctx.makeNotePrivateUseCase().execute(context, { noteId });

    describe('Scenario: R5, the owner makes a shared note private', () => {
        it('changes the visibility and records one event', async () => {
            const note = ctx.givenNoteOf(AS_A);
            ctx.advanceHours(1);
            const view = await run(AS_A, note.id.getValue());
            expect(view.visibility).toBe(NoteVisibilityEnum.PRIVATE);
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                visibility: NoteVisibilityEnum.PRIVATE,
                metadata: { updatedAt: CHANGED_AT.toISOString() },
            });
            const expected = {
                eventId: expect.stringMatching(/^00000000-0000-7000-8000-/),
                eventName: NoteMadePrivateEvent.EVENT_NAME,
                aggregateId: note.id.getValue(),
                context: AS_A,
                data: null,
                occurredAt: CHANGED_AT,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R5, the other partner tries on a shared note', () => {
        it('refuses, reserved to the owner, and changes nothing', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(run(AS_B, note.id.getValue())).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
            });
            expect(ctx.noteRepository.persistedEvents).toEqual([]);
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: R4, the other partner tries on a private note', () => {
        it('answers not found', async () => {
            const note = ctx.givenPrivateNoteOf(AS_A);
            await expect(run(AS_B, note.id.getValue())).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R5, editors of the note are connected', () => {
        it('disconnects the editors who lose the note', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await ctx
                .makeNotePrivateUseCase()
                .execute(AS_A, { noteId: note.id.getValue() });
            expect(ctx.noteCollaborationProvider.disconnections).toEqual([
                { noteId: note.id.getValue(), keptUserId: AS_A.userId },
            ]);
        });

        it('disconnects nobody when the change is refused', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(
                ctx
                    .makeNotePrivateUseCase()
                    .execute(AS_B, { noteId: note.id.getValue() }),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
            });
            expect(ctx.noteCollaborationProvider.disconnections).toEqual([]);
        });
    });
});
