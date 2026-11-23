import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteDeletedEvent } from '../../domain/events/note-deleted.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const DELETED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: delete a note', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const remove = (context: typeof AS_A, noteId: string) =>
        ctx.deleteNoteUseCase().execute(context, { noteId });

    describe('Scenario: R7, the owner deletes the note', () => {
        it('deletes it softly, for both partners', async () => {
            const note = ctx.givenNoteOf(AS_A);
            ctx.advanceHours(1);
            await remove(AS_A, note.id.getValue());
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                version: 2,
                metadata: {
                    updatedAt: DELETED_AT.toISOString(),
                    deletedAt: DELETED_AT.toISOString(),
                },
            });
            expect(await ctx.listNotesUseCase().execute(AS_B)).toEqual([]);
        });

        it('persists then publishes one deleted event', async () => {
            const note = ctx.givenNoteOf(AS_A);
            ctx.advanceHours(1);
            await remove(AS_A, note.id.getValue());
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: NoteDeletedEvent.EVENT_NAME,
                aggregateId: note.id.getValue(),
                context: AS_A,
                data: null,
                occurredAt: DELETED_AT,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });

        it('answers not found once deleted', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await remove(AS_A, note.id.getValue());
            await expect(
                remove(AS_A, note.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            });
        });
    });

    describe('Scenario: R7, the other partner tries on a shared note', () => {
        it('refuses, reserved to the owner, and changes nothing', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(
                remove(AS_B, note.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_RESERVED_TO_OWNER,
            });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                metadata: { deletedAt: null },
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: another couple', () => {
        it('answers not found (core.md rule 27)', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(
                remove(AS_STRANGER, note.id.getValue()),
            ).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
            });
        });
    });
});
