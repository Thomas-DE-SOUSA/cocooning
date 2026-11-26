import { NoteExceptionCodeEnum } from '@cocooning/couple-contract/notes';
import {
    NoteListKindEnum,
    NoteSpaceEnum,
    NoteVisibilityEnum,
} from '@cocooning/couple-shared-kernel/enums';
import { NoteListEditedEvent } from '../../domain/events/note-list-edited.event';
import type { Note } from '../../domain/models/note.aggregate';
import { NoteId } from '../../domain/value-objects/note-id.vo';
import {
    AS_A,
    AS_B,
    AS_STRANGER,
    MILLISECONDS_PER_HOUR,
    NOW,
    NotesTestContext,
} from '../../__tests__/fixtures/notes-test.context';

const EDITED_AT = new Date(NOW.getTime() + MILLISECONDS_PER_HOUR);

describe('Feature: change the title and the emoji of a list (R6, R26)', () => {
    let ctx: NotesTestContext;

    beforeEach(() => {
        ctx = new NotesTestContext();
    });
    afterEach(() => NoteId.resetForTests());

    const edit = (
        context: typeof AS_A,
        note: Note,
        title: string,
        emoji: string | null,
    ) =>
        ctx
            .editNoteListUseCase()
            .execute(context, { noteId: note.id.getValue(), title, emoji });

    describe('Scenario: R6, the other partner edits a shared list', () => {
        let list: Note;

        beforeEach(() => {
            list = ctx.givenListOf(AS_A);
            ctx.advanceHours(1);
        });

        it('returns the list with its new title and emoji, still owned by its creator', async () => {
            await expect(edit(AS_B, list, ' Lidl ', '🥖')).resolves.toEqual({
                noteId: list.id.getValue(),
                title: 'Lidl',
                emoji: '🥖',
                visibility: NoteVisibilityEnum.SHARED,
                isOwner: false,
                openItemCount: 0,
                updatedAt: EDITED_AT,
            });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                title: 'Lidl',
                listKind: NoteListKindEnum.GROCERIES,
                emoji: '🥖',
                version: 2,
                metadata: { updatedAt: EDITED_AT.toISOString() },
            });
        });

        it('removes the emoji with null', async () => {
            await expect(edit(AS_B, list, 'Lidl', null)).resolves.toMatchObject(
                { emoji: null },
            );
        });

        it('persists then publishes one edited event, without the title or the emoji', async () => {
            await edit(AS_B, list, 'Lidl', '🥖');
            const expected = {
                eventId: '00000000-0000-7000-8000-000000000003',
                eventName: NoteListEditedEvent.EVENT_NAME,
                aggregateId: list.id.getValue(),
                context: AS_B,
                data: null,
                occurredAt: EDITED_AT,
            };
            expect(ctx.noteRepository.persistedEvents).toEqual([expected]);
            expect(ctx.eventPublisher.published).toEqual([expected]);
            expect(JSON.stringify(ctx.eventPublisher.published)).not.toMatch(
                /Lidl|🥖/u,
            );
        });
    });

    describe('Scenario: R4, a list the partner cannot see', () => {
        it.each([
            ['the private list of the other', AS_B],
            ['a list of another couple', AS_STRANGER],
        ])(
            'answers not found for %s, and changes nothing',
            async (_label, context) => {
                const list = ctx.givenListOf(
                    AS_A,
                    'Cadeaux',
                    NoteListKindEnum.TASKS,
                    NoteSpaceEnum.PRIVATE,
                );
                await expect(
                    edit(context, list, 'Volé', null),
                ).rejects.toMatchObject({
                    code: NoteExceptionCodeEnum.NOTE_NOT_FOUND,
                });
                expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                    title: 'Cadeaux',
                    version: 1,
                });
            },
        );
    });

    describe('Scenario: R26, an ordinary note is not a list', () => {
        it('answers list not found, and changes nothing', async () => {
            const note = ctx.givenNoteOf(AS_A);
            await expect(edit(AS_A, note, 'Lidl', '🥖')).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_LIST_NOT_FOUND,
            });
            expect(ctx.noteRepository.storedSnapshots[0]).toMatchObject({
                title: 'Courses',
                listKind: null,
                emoji: null,
            });
            expect(ctx.noteRepository.persistedEvents).toEqual([]);
        });
    });

    describe('Scenario: an invalid emoji or title', () => {
        it.each([
            [
                'an empty emoji',
                'Lidl',
                ' ',
                NoteExceptionCodeEnum.NOTE_LIST_EMOJI_INVALID,
            ],
            [
                'an empty title',
                ' ',
                null,
                NoteExceptionCodeEnum.NOTE_TITLE_INVALID,
            ],
        ])('refuses %s', async (_label, title, emoji, code) => {
            const list = ctx.givenListOf(AS_A);
            await expect(edit(AS_A, list, title, emoji)).rejects.toMatchObject({
                code,
            });
            expect(ctx.eventPublisher.published).toEqual([]);
        });
    });

    describe('Scenario: both partners edit at the same time', () => {
        it('refuses the second write on the version', async () => {
            const list = ctx.givenListOf(AS_A);
            ctx.noteRepository.simulateConcurrentSave(list);
            await expect(edit(AS_B, list, 'Lidl', null)).rejects.toMatchObject({
                code: NoteExceptionCodeEnum.NOTE_VERSION_CONFLICT,
            });
        });
    });
});
