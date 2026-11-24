import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import { NoteVisibilityEnum } from '@cocooning/couple-shared-kernel/enums';
import { NoteRenamedEvent } from '../../domain/events/note-renamed.event';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
    PARTNER_A,
} from '../../__tests__/fixtures/notes-test.context';

const RENAMED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: rename a note', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const rename = (context: typeof AS_A, note: Note, title: string) =>
        ctx
            .renameNoteUseCase()
            .execute(context, { noteId: note.id.getValue(), title });

    describe('Scenario: R6, the other partner renames a shared note', () => {
        let note: Note;

        beforeEach(() => {
            note = ctx.givenNoteOf(AS_A);
            ctx.advanceHours(1);
        });

        it('returns the renamed note, still owned by its creator', async () => {
            await expect(
                rename(AS_B, note, 'Courses du samedi'),
            ).resolves.toEqual({
                noteId: note.id.getValue(),
                ownerId: PARTNER_A,
                isOwner: false,
                title: 'Courses du samedi',
                visibility: NoteVisibilityEnum.SHARED,
                updatedAt: RENAMED_AT,
            });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                title: 'Courses du samedi',
                version: 2,
                metadata: { updatedAt: RENAMED_AT.toISOString() },
            });
        });

        it('persists then publishes one renamed event, without the title', async () => {
            await rename(AS_B, note, 'Courses du samedi');
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: NoteRenamedEvent.EVENT_NAME,
                aggregateId: note.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: RENAMED_AT,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
        });
    });

    describe('Scenario: R4, a note the partner cannot see', () => {
        it.each([
            ['the private note of the other', AS_B],
            ['a note of another couple', AS_STRANGER],
        ])(
            'answers not found for %s, and changes nothing',
            async (_label, context) => {
                const note = ctx.givenPrivateNoteOf(AS_A);
                await expect(
                    rename(context, note, 'Volé'),
                ).rejects.toMatchObject({
                    code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
                });
                expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                    title: 'Idées cadeaux',
                });
                expect(ctx.eventPublisher.published).toEqual([]);
            },
        );
    });

    describe('Scenario: R8, an invalid title', () => {
        it('refuses it and changes nothing', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(rename(AS_A, note, ' ')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
            });
            expect(ctx.noteRepository.persistedEvents).toEqual([]);
        });
    });

    describe('Scenario: both partners rename at the same time', () => {
        it('refuses the second write on the version', async () => {
            const note = ctx.givenNoteOf(AS_A);
            ctx.noteRepository.simulateConcurrentSave(note);
            await expect(rename(AS_B, note, 'Courses')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
            });
        });
    });
});
