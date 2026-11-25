import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteSharedEvent } from '../../domain/events/note-shared.event';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const CHANGED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: share a note', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const run = (context: typeof AS_A, noteId: string) =>
        ctx.shareNoteUseCase().execute(context, { noteId });

    describe('Scenario: R5, the owner shares a private note', () => {
        it('changes the visibility and records one event', async () => {
            const note = ctx.givenPrivateNoteOf(AS_A);
            ctx.advanceHours(1);
            const view = await run(AS_A, note.id.getValue());
            expect(view.visibility).toBe(NoteVisibilityEnum.SHARED);
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                visibility: NoteVisibilityEnum.SHARED,
                metadata: { updatedAt: CHANGED_AT.toISOString() },
            });
            const expected = {
                eventId: expect.stringMatching(/^00000000-0000-7000-8000-/),
                eventName: NoteSharedEvent.EVENT_NAME,
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

    describe('Scenario: R11, a note filed in a folder changes space', () => {
        it('goes to the root of its new space, the folder staying in the old one', async () => {
            const folder = ctx.givenFolderOf(
                AS_A,
                'Rangement',
                null,
                NoteSpaceEnum.PRIVATE,
            );
            const note = ctx.givenNoteOf(AS_A, 'Courses', folder);
            const view = await ctx
                .shareNoteUseCase()
                .execute(AS_A, { noteId: note.id.getValue() });
            expect(view.folderId).toBeNull();
        });
    });

    describe('Scenario: R11, a shared note filed in a folder is shared again', () => {
        it('stays in its folder, its space unchanged', async () => {
            const folder = ctx.givenFolderOf(AS_A, 'Maison');
            const note = ctx.givenNoteOf(AS_A, 'Courses', folder);
            const view = await ctx
                .shareNoteUseCase()
                .execute(AS_A, { noteId: note.id.getValue() });
            expect(view.folderId).toBe(folder.id.getValue());
        });
    });
});
